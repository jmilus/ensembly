import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const createBroadcast = async (data) => {
    const { id, subject, body } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: broadcastId, error } = await supabase
        .from("Broadcast")
        .upsert({
            id: id === 'new' ? undefined : id,
            subject,
            body: body || null
        })
        .select('id')
    
    if (error) {
        console.error("create new Broadcast error:", error);
        return new Error(error);
    }

    return broadcastId[0];
}

export const getManyBroadcasts = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data: broadcasts, error } = await supabase
        .from("Broadcast")
        .select('*')
    
    if (error) {
        console.error("fetch many Broadcasts error:", error);
        return new Error(error);
    }

    return broadcasts
}

export async function POST(request) {
    const req = await request.json();
    const res = await createBroadcast(req)
    return NextResponse.json(res)
}

export async function GET() {
    const res = await getManyBroadcasts()
    return NextResponse.json({ res })
}
