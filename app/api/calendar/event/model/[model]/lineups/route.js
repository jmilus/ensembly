import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';

export const manageEventLineup = async (props) => {
    const supabase = createServerComponentClient({ cookies })
    
    console.log({props})
    const { grid, model } = props;
    console.log({ grid })

    const { data: events, error: modelError } = await supabase.from("Event").select("id").eq('model', model)

    console.log({ events }, {modelError})

    const queries = [];

    events.forEach(event => {
        Object.keys(grid[event.id]).forEach(lineup => {
            let query;
            if (grid[event.id][lineup]) {
                query = supabase.from("EventLineup").insert({event: event.id, lineup})
            } else {
                query = supabase.from("EventLineup").delete().eq('event', event.id).eq('lineup', lineup)
            }
            queries.push(query);
        })
    })

    const { data: results, error: queryError } = await Promise.all(queries)

    if (queryError) {
        console.error("error managing lineup", error)
        return new Error(error)
    }

    if (results) console.log(results)

    return true;
}

export async function PUT(request, {params}) {
    const req = await request.json()
    let res = await manageEventLineup({grid: req, model: params.model})
    return NextResponse.json(res)
}

// ##########

export async function adoptLineups(props) {
    const supabase = createServerComponentClient({ cookies })
    const { lineups, model } = props;

    const { data: events, error: modelError } = await supabase.from("Event").select("id").eq('model', model)

    if (modelError) {
        console.error("there was a problem getting model events");
        return new Error(modelError);
    }

    const rows = events.map(event => {
        console.log({ event })
        return lineups.map(lineup => {
            console.log({lineup})
            return {event: event.id, lineup: lineup.id}
        })
    }).flat()

    console.log({ rows })

    const { data, error } = await supabase
        .from("EventLineup")
        .insert(rows)
    
    if (error) {
        console.error("error adopting lineups");
        return new Error(error)
    }
    return true;
}

export async function POST(request, {params}) {
    const req = await request.json()
    let res = await adoptLineups({lineups: req, model: params.model})
    return NextResponse.json(res)
}