import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { nester } from 'utils'

export const getManyDivisions = async (ensembleId, nested=false) => {
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
    // console.log("fetched all divisions:", divisions)

    if (nested) return nester(divisions, "parent_division")
    return divisions;
}

export async function GET(request, { params }) {
    const req = await request.json()
    const res = await getManyDivisions({...req, ensembleId: params.id})
    return NextResponse.json({ res })
}

//##########

