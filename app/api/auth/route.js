import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';
import { redirect } from 'next/navigation';

export async function getMemberUserProfile(member) {
    // console.log("getMemberUserProfile member:",{member})
    const supabase = createServerComponentClient({ cookies });
    const { userData, userError } = await supabase.auth.getUser()

    console.log({userData})

    if (!userData?.user) {
        throw userError;
        // return { email: "", member: {}, memberId: null, roles: [] };
    }
    
    // const filterValue

    let query = supabase
        .from('Profile')
        .select(`
            email,
            member,
            Member (*),
            roles
        `)

    if (member) {
        query = query.eq('member', member)
    } else {
        // console.log("getting profile by email:", session.user.email)
        query = query.eq('email', userData.email)
    }

    const { data: profile, error } = await query;

    if (error) {
        console.error("fetch a very specific member user error:", error)
        return new Error(`failed to fetch member user profile: ${error.message}`);
    }
    
    // console.log({ profile });

    return profile;
}

export async function GET(request) {
    const req = await request.json();
    const res = await getMemberUserProfile(req)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}

// ##############


export async function Signup(data) {
    const supabase = createServerComponentClient({ cookies });
    console.log(data);
    const { orgName, firstName, lastName, email, code } = data;

    if (code != 'greentoblue') return Error ("Code is Invalid.")

    const authSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const { data: user, error } = await authSupabase.auth.admin.inviteUserByEmail(email)

    if (error) {
        console.error("problem creating a new user for a new customer");
        return Error("failed to create new user");
    }
    // 
    const { data: result, error: signupError } = await authSupabase.rpc('initialize_new_customer', {
        customer_name: orgName,
        first_name: firstName,
        last_name: lastName,
        user_email: email
    });

    console.log({ result }, { signupError })

    if (signupError) {
        console.error("problem creating a new customer")
        return new Error("failed to sign up");
    }

    return true;
}

export async function POST(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await Signup(req);
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}