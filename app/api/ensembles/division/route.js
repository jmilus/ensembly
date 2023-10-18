import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { nester } from '../../../../utils/index'

export const getAllDivisions = async (nested=true) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: divisions, error } = await supabase
        .from('Division')
        .select(`
            *
        `)
    
    if (error) {
        console.error("fetch all divisions error:", error);
        return new Error(error)
    }
    // console.log("fetched all divisions:", divisions)

    if (nested) return nester(divisions, "parent_division")
    return divisions;
}

export async function GET(request, {params}) {
    const ensembleId = params.id
    const req = await request.json()
    const res = await getAllDivisions(req)
    return NextResponse.json({ res })
}