import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils'

export const createDivision = async (data) => {
    const { name, taxonomy, capacity, ensemble } = data;
    const supabase = createServerComponentClient({ cookies });
    console.log("create Division data:", data)

    const { data: division, error } = await supabase
        .from('Division')
        .insert({
            name,
            taxonomy,
            capacity,
            ensemble
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