import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getManyBroadcasts = async () => {
    const supabase = createClient();

    const { data: broadcasts, error } = await supabase
        .from("Broadcast")
        .select('*')
        .order('status_date', {ascending: false})
    
    if (error) {
        console.error("fetch many Broadcasts error:", error);
        return new Error(error);
    }

    return broadcasts
}

export async function GET() {
    const res = await getManyBroadcasts()
    return NextResponse.json({ res })
}

//########


// export const createBroadcast = async (data) => {
//     const { id, subject, body } = data;
//     const supabase = createClient();

//     console.log({ data })

//     const { data: broadcastId, error } = await supabase
//         .from("Broadcast")
//         .insert({
//             id: id === 'new' ? undefined : id,
//             subject,
//             body: JSON.stringify(body) || null
//         })
//         .select('id')
    
//     if (error) {
//         console.error("create new Broadcast error:", error);
//         return new Error(error);
//     }

//     return broadcastId[0];
// }

// export async function POST(request) {
//     const _req = await request.formData();
//     const req = extractFields(_req);
//     const res = await createBroadcast(req)
//     return NextResponse.json(res)
// }
