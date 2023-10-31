import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getMemberEmails } from '../members/[id]/email/route';

export const getMemberUser = async (props) => {
    const supabase = createServerComponentClient({ cookies });

    const { email, member } = props;

    let query = supabase
        .from('Profile')
        .select()
        .maybeSingle()
    
    if (email) query = query.eq('email', email)
    if (member) query = query.eq('member', member)

    const { data: userProfile, error } = await query;
    
    if (error) {
        console.error("fetch Member User error:", error);
        return Error(`fetch Member User error: ${error}`)
    }

    return userProfile;
}

export async function GET(request) {
    const req = await request.json();
    const res = await getMemberUser(req);
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}

// ######

export async function createUserAccount({ member }) {
    const supabase = createServerComponentClient({ cookies });
    const { data: {session}, error} = await supabase.auth.getSession()
    
    const admin = await getMemberUser({ email: session.user.email })

    const authSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const memberEmail = await getMemberEmails({ member: member, type: "Primary" })
    console.log({ memberEmail })
    if (!memberEmail) return;
    
    const { data: createdUser, error: authError } = await authSupabase.auth.admin.inviteUserByEmail(memberEmail?.email)

    if (authError) {
        console.error("error creating new User:", authError)
        return new Error(authError);
    }
    console.log("user created", createdUser)

    const { data: userProfile, error: profileError } = await supabase
        .from('Profile')
        .insert({
            email: memberEmail?.email,
            member: member,
            user: createdUser.user.id,
            tenant: admin.tenant,
            roles: ["member"]
        })
    
    if (profileError) {
        console.error("error creating User Profile:", profileError)
        return new Error(profileError)
    }
    
    return {
        createdUser,
        userProfile
    }
}

export async function POST(request) {
    const req = await request.json();
    const res = await createUserAccount(req);
    return NextResponse.json(res)
}