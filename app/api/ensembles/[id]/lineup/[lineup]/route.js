import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { formatDBObject, nester } from '../../../../../../utils'

export const getOneLineup = async (id) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: lineup, error } = await supabase
        .from('Lineup')
        .select(`
            *,
            name,
            ensemble,
            is_primary,
            LineupAssignment ( 
                *, 
                EnsembleMembership ( *, Member (*) ), 
                Division (*)
            )
        `)
        .eq('id', id)

    if (error) {
        console.error("get lineup error:", error);
        return new Error(error);
    }

    console.log("lineup:", lineup[0])

    let lineup_divs = [];
    if (lineup[0].lineup_divisions != null) {
        const { data: lineup_divisions, error: divisionsError } = await supabase
            .from("Division")
            .select('*')
            .in('id', lineup[0].lineup_divisions)
    
        if (divisionsError) console.log("error fetching lineup_divisions");
        lineup_divs = [...lineup_divisions];
    }
    lineup[0].divisions = nester(lineup_divs, "parent_division")

    // console.log("getOneLineup:", lineup);
    return formatDBObject(lineup[0]);
}

export const updateOneLineup = async (data) => {
    const { id, name } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: lineup, error } = await supabase
        .from('Lineup')
        .update({name})
        .eq('id', id)
        .select()
    
    if (error) {
        console.error("update lineup error:", error);
        return new Error(error)
    }
    if(lineup) console.log("update lineup data:", data)

    return data;
}

export const duplicateOneLineup = async (data) => {
    const { name, id } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: lineupId, error } = await supabase
        .rpc('clone_lineup', { lineup_id: id, new_name: name })
    
    if (error) {
        console.error("lineup duplication error", error)
        return new Error(error)
    }

    // console.log("duplicated lineup:", lineupId)
    return { id: lineupId };
}

// fetch
export async function GET(request, { params }) {
    const { id } = params;
    // const req = await request.json()
    const res = await getOneLineup(id)
    return NextResponse.json({ res })
}

// update
export async function PUT(request, { params }) {
    const id = params.id;
    const req = await request.json()
    const res = await updateOneLineup({...req, id: id})
    return NextResponse.json({ res })
}

// insert (duplicate)
export async function POST(request, { params }) {
    const id = params.lineup;
    const req = await request.json()
    const res = await duplicateOneLineup({...req, id: id})
    return NextResponse.json({ res })
}