import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { nester } from '../../../../utils/index'

export const getManyDivisions = async (ensembleId, nested=true) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: divisions, error } = await supabase
        .from('Division')
        .select(`
            *
        `)
        .eq('ensemble', ensembleId)
    
    if (error) {
        console.error("fetch all divisions error:", error);
        return new Error(error)
    }
    console.log("fetched all divisions:", divisions)

    if (nested) return nester(divisions)
    return divisions;
}

export const createDivision = async (data) => {
    const { name, type } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: division, error } = await supabase
        .from('Division')
        .insert([
            {
                name,
                type: parseInt(type),
                logoUrl: data.logoUrl ? data.logoUrl : null
            }
        ])
        .select()
    
    if (error) {
        console.error("create division error:", error)
        return new Error(error);
    }
    
    console.log("created division:", {division})
    return division[0];
}

export async function GET(request, {params}) {
    const ensembleId = params.id
    const req = await request.json()
    const res = await getManyDivisions(req)
    return NextResponse.json({ res })
}

export async function POST(request) {
    const req = await request.json()
    const res = await createDivision(req)
    return NextResponse.json({ res })
}