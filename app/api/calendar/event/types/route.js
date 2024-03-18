import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';

export const getAllEventTypes = async () => {
    const supabase = createClient();

    const { data: types, error } = await supabase
        .from('EventType')
        .select('*')
    
    if (error) {
        console.error("fetch all event types error:", error);
        return new Error(error);
    }

    return types;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getAllEventTypes(req)
    return NextResponse.json({ res })
}