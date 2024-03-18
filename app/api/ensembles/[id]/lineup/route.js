import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getManyLineups = async (ensemble) => {
    const supabase = createClient();

    let query = supabase
        .from('Lineup')
        .select()

    if (ensemble) query = query.eq('ensemble', ensemble)

    const { data: lineups, error } = await query;
    
    if (error) {
        console.error("fetch all lineups error:", error);
        return new Error(error)
    }
    // console.log("fetched all lineups:", lineups)

    return lineups;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getManyLineups(req)
    return NextResponse.json(res)
}

//#####

export const createLineup = async (data) => {
    const { name, ensemble } = data;
    const supabase = createClient();

    console.log("creating lineup:", data)

    const { data: lineup, error } = await supabase
        .from('Lineup')
        .insert([
            {
                name,
                ensemble
            }
        ])
        .select()
        .single()
    
    if (error) {
        console.error("create lineup error:", error)
        return new Error(error);
    }
    
    // console.log("created lineup:", {lineup})
    return lineup;
}

export async function POST(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createLineup({...req, ensemble: params.id})
    return NextResponse.json(res)
}