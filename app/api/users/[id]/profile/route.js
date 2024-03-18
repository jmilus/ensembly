import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export async function updateUserProfile(props) {
    const supabase = createClient();

    console.log(props)
    const { roles, id } = props;

    const { data, error } = await supabase
        .from('Profile')
        .update({
            roles: Array.isArray(roles) ? roles : [roles]
        })
        .eq('user', id)
    
    if (error) {
        console.error("update user account:", error)
        return new Error(error)
    }

    return true;
}

export async function PUT(request, { params }) {
    const _req = await request.formData();
    const req = extractFields(_req);
    console.log("update user:", {req})
    const res = await updateUserProfile({ ...req, id: params.id });
    return NextResponse.json({res})
}