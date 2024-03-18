import 'server-only';

import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getProfile() {
    // console.log({ids})
    const supabase = createClient();
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
        .eq('email', session.user.email)

    if (error) {
        console.error("fetch member user error:", error)
        return;
    }
    
    // console.log({ profile });

    return {
        member: profile[0].member,
        role: profile[0].SecurityRole.role,
        permissions: profile[0].SecurityRole.permissions
    };
}

export async function GET({ params }) {
    const res = await getMemberUser(params.id)
    return NextResponse.json({ res })
}