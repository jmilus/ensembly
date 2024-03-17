import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const updateLineupAssignment = async ({membership, lineup, division, new_division, title}) => {
    const supabase = createServerComponentClient({ cookies });

    console.log({membership}, {lineup}, {division}, {new_division}, {title})

    const { data: updatedAssignment, error } = await supabase
        .from("LineupAssignment")
        .update({ division: new_division, title })
        .eq('membership', membership)
        .eq('lineup', lineup)
        .eq('division', division)
        .select()

    
    if (error) {
        console.error("error updating assignment:", error);
        return new Error(error);
    }

    console.log({updatedAssignment})

    return true;
}

export async function PUT(request, { params }) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await updateLineupAssignment({ ...req, ...params })
    console.log("this was the response:", res)
    return NextResponse.json(res)
}

// #####

export const deleteLineupAssignment = async ({ membership, lineup, division }) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: deletedAssignment, error } = await supabase
        .from("LineupAssignment")
        .delete()
        .eq('division', division)
        .eq('membership', membership)
        .eq('lineup', lineup)

    
    if (error) {
        console.error("error deleting assignment:", error);
        return new Error(error);
    }

    return true;
}

export async function DELETE(request, { params }) {
    const res = await deleteLineupAssignment(params)
    console.log("this was the response:", res)
    return NextResponse.json(res)
}