import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const updateOnePhoneNumber = async (data) => {
    const { id, prefix, number, type, memberId } = data;
    const supabase = createServerComponentClient({ cookies });

    console.log("update member phone data:", data)

    const { data, error } = await supabase
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

    return data;
}

export async function PUT(request, { params }) {
    const id = params.id;
    const req = await request.json()
    const res = await updateOnePhoneNumber({...req, id: id})
    return NextResponse.json({ res })
}