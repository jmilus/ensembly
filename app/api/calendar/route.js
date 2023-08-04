import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { formatDBObject } from '../../../utils';

export const getManyEvents = async ({ startDate, endDate }) => {
    const supabase = createServerComponentClient({ cookies });

    console.log({ startDate }, { endDate })

    const { data: fetchedEvents, error } = await supabase
        .from('Event')
        .select(`*,
            model:EventModel (*, 
                type (*)),
            location (*),
            Attendance (*)
        `)
        .gte('eventEndDate', new Date(startDate).toISOString() || undefined)
        .lte('eventStartDate', new Date(endDate).toISOString() || undefined)
    
    if (error) {
        console.log("Fetch Many Events error:", { error })
        return new Error(error);
    }
    
    console.log("get many Events:", {fetchedEvents})
    const processedEvents = fetchedEvents.map(event => {
        return formatDBObject(event);
    })
    
    return processedEvents;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getManyEvents(req)
    return NextResponse.json({res})
}