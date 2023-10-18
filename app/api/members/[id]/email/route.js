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
        query = query.maybeSingle();
    }

    const { data, error } = await query;
    
    if (error) console.error("fetch email error:", error);

    return data;
}

export async function GET(request, { params }) {
    const req = await request.json();
    const res = await getMemberEmails({...req, member: params.id});
    return NextResponse.json(res)
}