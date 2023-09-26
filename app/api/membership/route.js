import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getAllMemberships = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
        .from('EnsembleMembership')
        .select('*')
    
    if (error) {
        console.error("fetch all memberships error:", error);
        return new Error(error);
    }
    console.log("fetched all memberships:", data)

    return data;
}

export async function GET({request}) {
    const req = await request.json()
    console.log({req})
    const res = await getAllMemberships(req)
    return NextResponse.json({res})
}


// ############################################

export const createMembership = async (data) => {
    const { member, ensemble, status="Active", statusDate, statusNote, membershipType } = data;
    const supabase = createServerComponentClient({ cookies });
    console.log({ data })

    const { data: membership, error } = await supabase
        .from('EnsembleMembership')
        .insert([
            {
                member,
                ensemble,
                status,
                status_date: statusDate ? new Date(statusDate) : new Date(),
                status_note: statusNote,
                membership_type: membershipType
            }
        ])
        .select()
    
    if (error) {
        console.error("create membership error:", error)
        return new Error(error);
    }
    
    console.log({membership})
    return membership[0];
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createMembership(req)
    return NextResponse.json({ res })
}