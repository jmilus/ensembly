import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getAllMembershipCapacities = async () => {
    const supabase = createServerComponentClient({ cookies });

    let { data, error } = await supabase
        .from('MembershipCapacity')
        .select()
        .order('id', { ascending: true })
    
    if (error) {
        console.error("fetch all membership capacities error:", error);
        return new Error(error);
    }
    // console.log("fetched all membership capacities:", data)

    return data;
}

export async function GET() {
    const res = await getAllMembershipCapacities()
    return NextResponse.json({res})
}