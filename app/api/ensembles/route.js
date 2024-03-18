'use server';

import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { extractFields } from 'utils';

export async function getManyEnsembles() {
    const supabase = createClient();

    const { data: ensembles, error } = await supabase
        .from('Ensemble')
        .select(`
            created_at,
            id,
            logoUrl,
            name,
            ensemble_type:type (*)
        `)
        .order('created_at', { ascending: true })
    
    if (error) {
        console.error("fetch all ensembles error:", error);
        return new Error(error)
    }
    // console.log("fetched all ensembles:", ensembles)

    return ensembles;
}

export async function GET() {
    const res = await getManyEnsembles()
    return NextResponse.json(res)
}

//##############

export const createEnsemble = async (data) => {
    const { name, type } = data;
    const supabase = createClient();

    const { data: ensemble, error } = await supabase
        .from('Ensemble')
        .insert([
            {
                name,
                type: type,
                logoUrl: data.logoUrl ? data.logoUrl : null
            }
        ])
        .select()
        .single()
    
    if (error) {
        console.error("create ensemble error:", error)
        return new Error(error);
    }
    
    console.log("created ensemble:", {ensemble})
    return ensemble;
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createEnsemble(req)
    return NextResponse.json(res)
}