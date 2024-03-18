import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { formatDBObject, nester, extractFields } from 'utils'

export const getOneLineup = async (id) => {
    const supabase = createClient();

    const { data: lineup, error } = await supabase
        .from('Lineup')
        .select(`
            *,
            name,
            ensemble,
            is_primary,
            LineupAssignment ( 
                *, 
                EnsembleMembership ( *, type:membership_type (*), Member (*) ), 
                Division (*)
            )
        `)
        .eq('id', id)

    if (error) {
        console.error("get lineup error:", error);
        return new Error(error);
    }

    // console.log("lineup:", lineup[0])

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

// fetch
export async function GET({ params }) {
    const res = await getOneLineup(params.id)
    return NextResponse.json({ res })
}

// ##########

export const updateOneLineup = async (data) => {
    const { id, name } = data;
    const supabase = createClient();

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

// update
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneLineup({...req, id: params.id})
    return NextResponse.json({ res })
}

// ########

export const duplicateOneLineup = async (data) => {
    const { name, id } = data;
    const supabase = createClient();

    console.log("duplicating lineup:", data)

    const { data: lineupId, error } = await supabase
        .rpc('clone_lineup', { lineup_id: id, new_name: name })
    
    if (error) {
        console.error("lineup duplication error", error)
        return new Error(error)
    }

    // console.log("duplicated lineup:", lineupId)
    return { id: lineupId };
}

// insert (duplicate)
export async function POST(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req)
    const res = await duplicateOneLineup({...req, id: params.lineup})
    return NextResponse.json({ res })
}

// #########

export const deleteOneLineup = async (data) => {
    const { id } = data;
    const supabase = createClient();

    console.log("deleting lineup:", data)

    const { data: lineupId, error } = await supabase
        .from('Lineup')
        .delete()
        .eq('id', id)
    
    if (error) {
        console.error("lineup deletion error", error)
        return new Error(error)
    }

    // console.log("duplicated lineup:", lineupId)
    return { id: lineupId };
}

// insert (duplicate)
export async function DELETE(request, { params }) {
    const res = await deleteOneLineup({ id: params.lineup })
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}