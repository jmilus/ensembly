import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getAllAssignments = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data: assignments, error } = await supabase
        .from('LineupAssignment')
        .select(`
            *,
            EnsembleMembership (*, Member (*))
        `)
    
    if (error) {
        console.error("fetch all assignments error:", error);
        return new Error(error);
    }

    // console.log("fetched all assignments:", assignments)

    return assignments;
}

export const updateLineupAssignments = async ({ lineup, assignments, deletions }) => {
    const supabase = createServerComponentClient({ cookies });

    console.log("assignments:", assignments)

    const newAssignments = []
    const changedAssignments = []

    assignments.forEach(as => {
        if (as.newDivision) {

            if (!as.Division) {
                newAssignments.push(as);
            } else {
                changedAssignments.push(as)
            }
        }
    })

    const adds = newAssignments.map(na => {
        return supabase.from('LineupAssignment').insert([
            {
                lineup,
                division: na.newDivision.id,
                membership: na.EnsembleMembership.id
            }
        ])
    })

    const updates = changedAssignments.map(ca => {
        console.log("changing assignment:", ca)
        return supabase.from('LineupAssignment').update(
            {
                division: ca.newDivision.id
            }
        )
        .eq('division', ca.Division.id)
    })

    const deletes = deletions.map(de => {
        return supabase.from('LineupAssignment')
            .delete()
            .eq('lineup', lineup)
            .eq('division', de.Division.id)
            .eq('membership', de.EnsembleMembership.id)
    })

    // console.log({ adds }, { updates }, {deletes})
    
    const { error } = await Promise.all([...deletes, ...updates, ...adds])

    if (error) {
        console.error("error updating assignments:", error);
        return new Error(error);
    }

    return true;
}

export async function GET() {
    const res = await getAllAssignments()
    return NextResponse.json({ res })
}

export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateLineupAssignments({ ...req, lineup: params.lineup })
    console.log("this was the response:", res)
    return NextResponse.json(res)
}