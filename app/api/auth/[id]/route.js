import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getProfile = async (ids) => {
    // console.log({ids})
    const supabase = createServerComponentClient({ cookies });
    const member = ids?.member;
    const user = ids?.user;
    // console.log("getProfile ids:", { member }, { user })
    const { data: { session } } = await supabase.auth.getSession()

    const userId = user ? user : session?.user?.id;

    if (!member && !userId) return {user: null, member: null, permissions: null, role: null};
    
    const filter = member ? { member } : { user: userId }

    const { data: profile, error } = await supabase
        .from('Profile')
        .select(`
            user,
            member (*),
            role (
                permissions,
                role
            )
        `)
        .match(filter)

    if (error) {
        console.error("fetch member user error:", error)
        return;
    }
    
    // console.log({ profile });

    return {
        user: profile[0].user,
        member: profile[0].member,
        role: profile[0].role.role,
        permissions: profile[0].role.permissions
    };
}

export async function GET(request, { params }) {
    const { id } = params;
    const req = await request.json()
    const res = await getMemberUser(id)
    return NextResponse.json({ res })
}