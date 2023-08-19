import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getOneBroadcast = async (id) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: broadcast, error } = await supabase
        .from("Broadcast")
        .select()
        .eq('id', id)
    
    if (error) {
        console.error("fetch one Broadcast error:", error);
        return new Error(error);
    }

    return broadcast;
}

export async function GET(request, { params }) {
    const {id} = params;
    const req = await request.json()
    const res = await getOneBroadcast({...req, id})
    return NextResponse.json({ res })
}