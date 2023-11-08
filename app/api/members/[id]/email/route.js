import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getMemberEmails = async ({member, type}) => {
    const supabase = createServerComponentClient({ cookies });

    console.log("fetch member email:", member, type)

    let query = supabase
        .from('EmailAddress')
        .select('email')
        .eq('member', member)

    if (type) {
        query = query.eq('type', type);
    }

    const { data: emails, error } = await query;
    
    if (error) {
        console.error("fetch email error:", error);
        return new Error(`fetch email error: ${error}`)
    }

    if (emails.length > 0) return emails[0];
    return null;
}

export async function GET(request, { params }) {
    const req = await request.json();
    const res = await getMemberEmails({ ...req, member: params.id });
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}