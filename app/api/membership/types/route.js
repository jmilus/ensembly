import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getManyMembershipTypes = async (ensembles) => {
    const supabase = createClient();

    let query = supabase
        .from('MembershipType')
        .select()
        .order('id', { ascending: true })
    
        
    if (ensembles) {
        const ensemblesList = Array.isArray(ensembles) ? ensembles : [ensembles];
        query = query.contains('ensembles', ensemblesList)
    }

    const { data, error } = await query
    
    if (error) {
        console.error("fetch all membership types error:", error);
        return new Error(error);
    }
    // console.log("fetched all membership types:", data)

    return data;
}

export async function GET(request) {
    const req = await request.json()
    // console.log({req})
    const res = await getManyMembershipTypes(req)
    return NextResponse.json({res})
}

//

export const updateOneMembershipType = async (typeData) => {
    const { id, name, capacity, term_length, term_period, ensembles } = typeData;
    const supabase = createClient();

    console.log("update membership type data:", typeData)

    const { data: type, error } = await supabase
        .from('MembershipType')
        .upsert({
            id,
            name,
            capacity: Array.isArray(capacity) ? capacity : [capacity],
            term_length: parseInt(term_length),
            term_period,
            ensembles: Array.isArray(ensembles) ? ensembles : [ensembles]
        })
        .select()
    
    if (error) {
        console.error("upsert membership type error:", error);
        return new Error(error);
    }

    console.log("upsert membership type data:", type[0])

    return type[0];
}

// upsert
export async function PUT(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneMembershipType(req)
    return NextResponse.json({ res })
}