import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils'

export const updateDivision = async (data) => {
    const { id, name, taxonomy, capacity, parent_division } = data;
    const supabase = createClient();
    console.log("update Division data:", data)

    const { data: division, error } = await supabase
        .from('Division')
        .update({
            name,
            taxonomy,
            capacity,
            parent_division
        })
        .eq('id', id)
        .select()
    
    if (error) {
        console.error("update division error:", error)
        return new Error(error);
    }
    
    console.log("created division:", {division})
    return division[0];
}

export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateDivision({...req, id: params.div})
    return NextResponse.json({ res })
}

//#####

export const deleteDivision = async (data) => {
    const { id } = data;
    const supabase = createClient();
    console.log("delete Division data:", data)

    const { data: deleted, error } = await supabase
        .from('Division')
        .delete()
        .eq('id', id)
    
    if (error) {
        console.error("deleted division error:", error)
        return new Error(error);
    }
    console.log("deleted:", { deleted })
    return true;
}

export async function DELETE(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await deleteDivision({...req, id: params.div})
    return NextResponse.json({ res })
}