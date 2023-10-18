import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

const changePassword = async (props) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
    })
    
    console.log({ props })

    const { id, newPassword } = props;
    
    const { data: user, error } = await supabase.auth.admin.updateUserById(
        id,
        { password: newPassword }
    )

    if (error) {
        console.log("there was trouble updating the password:", error);
    } else {
        console.log("success:", user);
    }

    return true;
}

export async function PUT(request, { params }) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await changePassword({ ...req, ...params })
    console.log("this was the response:", res)
    return NextResponse.json(res)
}