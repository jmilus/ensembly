import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const bulkUpdateModelLineups = async (props) => {
    const supabase = createClient();

    console.log("updateEventLineups received:", props)
    const { lineups, initialLineups, events } = props;

    let lineupsList = Array.isArray(lineups) ? lineups : [lineups];

    console.log({ lineupsList }, { initialLineups }, { events })

    // const initialLineupsArray = initialLineups === "" ? [] : initialLineups;

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

export async function PUT(request) {
    const _req = await request.formData()
    const req = extractFields(_req)
    let res = await bulkUpdateModelLineups(req)

    return NextResponse.json(res)
}

//