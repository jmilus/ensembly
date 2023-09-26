import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const updateOneEmail = async (emailData) => {
    const { id, email, rank, memberId } = emailData;
    const supabase = createServerComponentClient({ cookies });

    console.log("update member email data:", emailData)

    const { data, error } = await supabase
        .from('EmailAddress')
        .upsert({
            id: id === 'undefined' ? undefined : id,
            email,
            rank,
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
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await updateOneEmail({...req, id: params.id})
    return NextResponse.json({ res })
}