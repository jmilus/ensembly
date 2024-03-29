import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils'

export const createDivision = async (data) => {
    const { name, taxonomy, capacity, ensemble, parent_division } = data;
    const supabase = createClient();
    console.log("create Division data:", data)

    const { data: division, error } = await supabase
        .from('Division')
        .insert({
            name,
            taxonomy,
            capacity,
            ensemble,
            parent_division
        })
        .select()
    
    if (error) {
        console.error("create division error:", error)
        return new Error(error);
    }
    
    console.log("created division:", {division})
    return division[0];
}

export async function POST(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createDivision({...req, ensemble: params.id})
    return NextResponse.json({ res })
}