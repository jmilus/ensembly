import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getOneEnsemble = async (id) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: [ensemble], error } = await supabase
        .from('Ensemble')
        .select(`
            *,
            EnsembleMembership ( id, Member (*)),
            Lineup (id, name, is_primary),
            EnsembleType (*)
        `)
        .eq('id', id)
        .neq('EnsembleMembership.status', "Inactive")

    if (error) {
        console.error("get ensemble error:", error);
        return new Error(error);
    }

    // console.log("getOneEnsemble:", ensemble);
    return ensemble;
}

export const updateOneEnsemble = async (ensembleData) => {
    const { id, name, type, logoUrl } = ensembleData;
    const supabase = createServerComponentClient({ cookies });

    // console.log("update ensemble profile data:", ensembleData)

    const { data: [ensemble], error } = await supabase
        .from('Ensemble')
        .update({
            name,
            type,
            logoUrl
        })
        .eq('id', id)
        .select()
    
    if (error) {
        console.error("update ensemble error:", error);
        return new Error(error);
    }

    // console.log("update ensemble data:", ensemble)

    return ensemble;
}

// fetch
export async function GET(request, { params }) {
    const { id } = params;
    // const req = await request.json()
    const res = await getOneEnsemble(id)
    return NextResponse.json({ res })
}

// update
export async function PUT(request, { params }) {
    const id = params.id;
    const req = await request.json()
    const res = await updateOneEnsemble({...req, id: id})
    return NextResponse.json({ res })
}