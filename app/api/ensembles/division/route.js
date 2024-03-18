import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { nester } from 'utils/index'

export const getAllDivisions = async (nested=true) => {
    const supabase = createClient();

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

export async function GET(request) {
    const req = await request.json()
    const res = await getAllDivisions(req)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}