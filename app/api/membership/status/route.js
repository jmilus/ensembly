import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getAllMembershipStatus = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
        .from('MembershipStatus')
        .select()
        .order('id', {ascending: true})
    
    if (error) {
        console.error("fetch all membership status error:", error);
        return new Error(error);
    }
    // console.log("fetched all membership status:", data)

    return data;
}

export async function GET(request) {
    const res = await getAllMembershipStatus()
    return NextResponse.json(res)
}