import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getManyEnsembles = async () => {
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

export async function GET(request) {
    const req = await request.json()
    const res = await getManyEnsembles(req)
    return NextResponse.json({ res })
}

export async function POST(request) {
    const req = await request.json()
    const res = await createEnsemble(req)
    return NextResponse.json({ res })
}