import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';

export const getAllEnsembleTypes = async () => {
    const supabase = createClient();

    const { data: types, error } = await supabase
        .from('EnsembleType')
        .select('*')
    
    if (error) {
        console.error("fetch all ensemble types error:", error);
        return new Error(error);
    }

    console.log("fetched all ensemble types:", types)

    return types;
}

export async function GET() {
    const res = await getAllEnsembleTypes()
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}