import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getMemberUserProfile(member) {
    // console.log("getMemberUserProfile member:",{member})
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return { user: null, email: "", member: {}, memberId: null, roles: [] };
    
    // const filterValue

    let query = supabase
        .from('Profile')
        .select(`
            user,
            email,
            member,
            Member (*),
            roles
        `)
        .maybeSingle()

    if (member) {
        // console.log("there was a member value:", member)
        query = query.eq('member', member)
    } else {
        // console.log("there was no member so using session:", session.user.id)
        query = query.eq('user', session.user.id)
    }
    // console.log({member})
    // if (member) query = query.eq('member', member);
    // if (member === undefined) query = query.eq('user', session.user.id)

    const { data: profile, error } = await query;

    if (error) {
        console.error("fetch a very specific member user error:", error)
        return new Error(`failed to fetch member user profile: ${error}`);
    }
    
    console.log({ profile });

    return profile || { user: null, email: "", member: {}, memberId: null, roles: []};
}

export async function GET(request) {
    const req = await request.json();
    const res = await getMemberUserProfile(req)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}