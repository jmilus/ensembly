import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';


export async function getOneEmail(id) {
    return true;
}

export async function GET(request, { params }) {
    const res = await getMemberEmails(params.id);
    return NextResponse.json({ res })
}


export const updateOneEmail = async (emailData) => {
    const { id, email, type, memberId } = emailData;
    const supabase = createClient();

    console.log("update member email data:", emailData)

    const { data, error } = await supabase
        .from('EmailAddress')
        .upsert({
            id: id === 'undefined' ? undefined : id,
            email,
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
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await updateOneEmail({...req, id: params.id})
    return NextResponse.json({ res })
}