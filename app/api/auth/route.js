import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getMemberUserProfile(member) {
    console.log("getMemberUserProfile member:",{member})
    const supabase = createServerComponentClient({ cookies });
    // console.log("getProfile ids:", { member }, { user })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return { user: null, member: null, permissions: null, role: null };

    let query = supabase
        .from('Profile')
        .select(`
            user,
            email,
            member,
            Member (*),
            roles
        `)

    if (member) {
        query = query.eq('member', member)
    } else {
        query = query.eq('user', session.user.id)
    }

    const { data: profile, error } = await query;

    if (error) {
        console.error("fetch a very specific member user error:", error)
        return;
    }
    
    // console.log({ profile });

    return {
        user: profile[0].user,
        email: profile[0].email,
        member: profile[0].Member,
        roles: profile[0].roles
    };
}

export async function GET(request) {
    const req = await request.json();
    const res = await getMemberUserProfile(req)
    return NextResponse.json({ res })
}