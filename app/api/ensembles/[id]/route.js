import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneEnsemble = async (id) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: ensemble, error } = await supabase
        .from('Ensemble')
        .select(`
            *,
            EnsembleMembership ( id, type:membership_type (*), Member (*)),
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
    return ensemble[0];
}

export const updateOneEnsemble = async (ensembleData) => {
    const { id, name, type, logoUrl } = ensembleData;
    const supabase = createServerComponentClient({ cookies });

    // console.log("update ensemble profile data:", ensembleData)

    const { data: ensemble, error } = await supabase
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

    return ensemble[0];
}

// fetch
export async function GET({ params }) {
    const res = await getOneEnsemble(params.id)
    return NextResponse.json({ res })
}

// update
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneEnsemble({...req, id: params.id})
    return NextResponse.json({ res })
}