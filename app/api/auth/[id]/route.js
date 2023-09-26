import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getProfile() {
    // console.log({ids})
    const supabase = createServerComponentClient({ cookies });
    // console.log("getProfile ids:", { member }, { user })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return { user: null, member: null, permissions: null, role: null };

    const { data: profile, error } = await supabase
        .from('Profile')
        .select(`
            email,
            member (*),
            SecurityRole (
                permissions,
                role
            )
        `)
        .eq('user', session.user.id)

    if (error) {
        console.error("fetch member user error:", error)
        return;
    }
    
    // console.log({ profile });

    return {
        user: profile[0].user,
        member: profile[0].member,
        role: profile[0].SecurityRole.role,
        permissions: profile[0].SecurityRole.permissions
    };
}

export async function GET({ params }) {
    const res = await getMemberUser(params.id)
    return NextResponse.json({ res })
}