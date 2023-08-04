import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

export const createMembership = async (data) => {
    const { member, ensemble, status="Active", statusDate, statusNote } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: membership, error } = await supabase
        .from('EnsembleMembership')
        .insert([
            {
                member,
                ensemble,
                status,
                statusDate: statusDate ? new Date(statusDate) : new Date(),
                statusNote
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

export async function GET(request) {
    const req = await request.json()
    const res = await getAllMemberships(req)
    return NextResponse.json({res})
}

export async function POST(request) {
    const req = await request.json()
    const res = await createMembership(req)
    return NextResponse.json({ res })
}