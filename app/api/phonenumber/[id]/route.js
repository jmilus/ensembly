import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const updateOnePhoneNumber = async (data) => {
    const { id, prefix, number, type, memberId } = data;
    const supabase = createClient();

    console.log("update member phone data:", data)

    const { data: phonenumber, error } = await supabase
        .from('PhoneNumber')
        .upsert({
            id: id === 'undefined' ? undefined : id,
            prefix,
            number,
            type,
            member: memberId
        })
        .select()
    
    if (error) {
        console.error("update email error:", error);
        return new Error(error);
    }

    return phonenumber[0];
}

export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOnePhoneNumber({...req, id: params.id})
    return NextResponse.json({ res })
}