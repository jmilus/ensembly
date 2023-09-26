import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { extractFields } from 'utils';

export async function getManyEnsembles() {
    const supabase = createServerComponentClient({ cookies });

    const { data: ensembles, error } = await supabase
        .from('Ensemble')
        .select(`
            *,
            type (*)
        `)
    
    if (error) {
        console.error("fetch all ensembles error:", error);
        return new Error(error)
    }
    // console.log("fetched all ensembles:", ensembles)

    return ensembles;
}

export async function GET() {
    const res = await getManyEnsembles()
    return NextResponse.json({ res })
}

//##############

export const createEnsemble = async (data) => {
    const { name, type } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: ensemble, error } = await supabase
        .from('Ensemble')
        .insert([
            {
                name,
                type: parseInt(type),
                logoUrl: data.logoUrl ? data.logoUrl : null
            }
        ])
        .select()
    
    if (error) {
        console.error("create ensemble error:", error)
        return new Error(error);
    }
    
    console.log("created ensemble:", {ensemble})
    return ensemble[0];
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createEnsemble(extractFields(req))
    return NextResponse.json({ res })
}