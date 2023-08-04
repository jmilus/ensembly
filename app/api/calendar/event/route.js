import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const updateEventLineups = async (props) => {
    const supabase = createServerComponentClient({ cookies });

    console.log("updateEventLineups received:", props)
    const { lineups, initialLineups, events } = props;

    let lineupsList = Array.isArray(lineups) ? lineups : [lineups];

    console.log({ lineupsList }, { initialLineups }, { events })

    const newLineups = lineupsList.filter(lineup => {
        return !initialLineups.includes(lineup)
    })
    
    const oldLineups = initialLineups.filter(modlu => {
        return !lineupsList.includes(modlu)
    })

    const addLineups = supabase.from('EventLineup').insert(events.map(event => {
        return newLineups.map(nlu => {
            return {event: event, lineup: nlu}
        })
    }).flat())

    const dropLineups = supabase
        .from('EventLineup')
        .delete()
        .filter('event', 'in', `(${events.join()})`)
        .filter('lineup', 'in', `(${oldLineups.join()})`)
    
    const { error } = Promise.all([addLineups, dropLineups])
    
    if (error) {
        console.error("update eventLineups error:", error);
        return new Error(error)
    }

    return true;
}

export const manageEventLineups = async (eventLineups) => {
    const supabase = createServerComponentClient({ cookies })
    
    console.log(eventLineups)

    const queries = Object.keys(eventLineups).map(event => {
        const eventSet = eventLineups[event];
        return Object.keys(eventLineups[event]).map(lu => {
            if (eventSet[lu]) {
                return supabase.from('EventLineup').insert({ event: event, lineup: lu }).neq('event', event).neq('lineup', lu);
            } else {
                return supabase.from('EventLineup').delete().eq('event', event).eq('lineup', lu)
            }
        })
    }).flat()

    const {error} = Promise.all(queries)

    return true;
}

export async function PUT(request) {
    const req = await request.json()
    let res;
    switch (req.route) {
        case "all":
            res = await updateEventLineups(req)
            break;
        default:
            res = await manageEventLineups(req)
    }

    return NextResponse.json({ res })
}