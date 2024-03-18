import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneMembership = async (membershipId) => {
    console.log({membershipId})
    const supabase = createClient();

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
    const res = await getOneMembership(params.membership)
    return NextResponse.json({ res })
}

//

export const updateOneMembership = async (props) => {
    const { membership, member, ensemble, status, statusDate, statusNote, membership_expires } = props;
    const supabase = createClient();

    console.log("update membership profile data:", props)

    const { data: updatedMembership, error } = await supabase
        .from('EnsembleMembership')
        .update({
            member,
            ensemble,
            status,
            statusDate: statusDate ? new Date(statusDate) : undefined,
            statusNote,
            membership_expires
        })
        .eq('id', membership)
        .select()
        .single()
    
    if (error) {
        console.error("update membership error:", error);
        return new Error(error);
    }

    // console.log("update membership data:", updatedMembership)

    return updatedMembership;
}

// update
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneMembership({...req, ...params})
    return NextResponse.json({ res })
}