import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { formatDBObject } from 'utils';

export const getManyEvents = async ({ startDate, endDate, ensemble }) => {
    const supabase = createServerComponentClient({ cookies });

    console.log({ startDate }, { endDate }, { ensemble })

    const { data: fetchedEvents, error } = await supabase
        .from('Event')
        .select(`*,
            model:EventModel (*, 
                type (*)),
            address (*),
            Attendance (*),
            lineups:EventLineup!left (
                Lineup (*)
            )
        `)
        .lte('eventStartDate', new Date(endDate).toISOString() || undefined)
        .gte('eventEndDate', new Date(startDate).toISOString() || undefined)
        .order('eventStartDate', { ascending: true })
    
    let manyEvents = [...fetchedEvents];
    if (ensemble) {
        manyEvents = fetchedEvents.filter(event => {
            return event.lineups.some(x => x.Lineup.ensemble === ensemble)
        })
    }
    
    
    
    if (error) {
        console.log("Fetch Many Events error:", { error })
        return new Error(error);
    }
    
    // console.log("get many Events:", {fetchedEvents})
    const processedEvents = manyEvents.map(event => {
        return formatDBObject(event);
    })
    
    return processedEvents;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getManyEvents(req)
    return NextResponse.json(res)
}