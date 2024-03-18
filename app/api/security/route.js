import 'server-only';

import { createClient } from 'utils/supabase/server';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getSecurityRoles(namesOnly) {
    const supabase = createClient();
    // console.log(namesOnly)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return { user: null, member: null, permissions: null, role: null };

    let query = supabase
        .from('SecurityRole')
        .select()
    
    if (namesOnly) query = query.select('role_name')
    
    const { data: securityRoles, error } = await query

    if (error) {
        console.error("fetch security roles error:", error)
        return new Error(error);
    }
    
    // console.log({ securityRoles });

    return securityRoles
}

export async function GET(request) {
    const req = await request.json()
    const res = await getSecurityRoles(req)
    return NextResponse.json({ res })
}