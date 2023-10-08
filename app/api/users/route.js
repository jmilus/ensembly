import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getMemberEmails } from '../members/[id]/email/route';
import { extractFields } from 'utils';

export const getMemberUser = async (props) => {
    const supabase = createServerComponentClient({ cookies });

    const { email, member } = props;

    let query = supabase
        .from('Profile')
        .select()
    
    if (email) query = query.eq('email', email)
    if (member) query = query.eq('member', member)

    const { data: userProfile, error } = await query;
    
    if (error) console.error("fetch Member User error:", error);

    return userProfile;
}

export async function GET(request) {
    const req = await request.json();
    const res = await getMemberUser(req);
    return NextResponse.json({ res })
}

// ######

export async function createUserAccount({member}) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const memberEmail = await getMemberEmails({ member: member, type: "Primary" })
    console.log({memberEmail})
    
    const { data: createdUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(memberEmail[0].email)

    if (authError) {
        console.error("error creating new User:", authError)
        return new Error(authError);
    }
    console.log("user created", createdUser)


    const { data: userProfile, error: profileError } = await supabase
        .from('Profile')
        .insert({
            email: memberEmail[0].email,
            member: member,
            user: createdUser.user.id
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

// #####

export async function updateUserAccount(props) {
    const supabase = createServerComponentClient({ cookies });

    console.log(props)
    const { roles, user } = props;

    const { data, error } = await supabase
        .from('Profile')
        .update({roles})
        .eq('user', user)
    
    if (error) {
        console.error("update user account:", error)
        return new Error(error)
    }

    return true;
}

export async function PUT(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    console.log("update user:", {req})
    const res = await updateUserAccount(req);
    return NextResponse.json({res})
}