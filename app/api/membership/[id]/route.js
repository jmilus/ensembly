import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneMembership = async (membershipId) => {
    console.log({membershipId})
    const supabase = createServerComponentClient({ cookies });

    const { data: [membership], error } = await supabase
        .from('EnsembleMembership')
        .select(`
            *
        `)
        .eq('id', membershipId)

    if (error) {
        console.error("get membership error:", error);
        return new Error(error);
    }

    // console.log("getOneMembership:", membership);
    return membership;
}

// fetch
export async function GET({ params }) {
    const res = await getOneMembership(params.id)
    return NextResponse.json({ res })
}

//

export const updateOneMembership = async (membershipData) => {
    const { id, member, ensemble, status, statusDate, statusNote } = membershipData;
    const supabase = createServerComponentClient({ cookies });

    console.log("update membership profile data:", membershipData)

    const { data: [membership], error } = await supabase
        .from('EnsembleMembership')
        .update({
            member,
            ensemble,
            status,
            statusDate: statusDate ? new Date(statusDate) : undefined,
            statusNote
        })
        .eq('id', id)
        .select()
    
    if (error) {
        console.error("update membership error:", error);
        return new Error(error);
    }

    console.log("update membership data:", membership)

    return membership;
}

// update
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneMembership({...req, id: params.id})
    return NextResponse.json({ res })
}