import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getAllMembershipCapacities = async () => {
    const supabase = createClient();

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