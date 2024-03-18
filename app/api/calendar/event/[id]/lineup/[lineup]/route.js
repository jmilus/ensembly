import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';

export const manageEventLineup = async (props) => {
    const supabase = createServerComponentClient({ cookies })
    
    console.log(props)
    const { add, event, lineup } = props;

    let query;
    if (add) {
        query = supabase.from("EventLineup").insert({event, lineup})
    } else {
        query = supabase.from("EventLineup").delete().eq('event', event).eq('lineup', lineup)
    }

    const { data, error } = await query;

    if (error) {
        console.error("error managing lineup", error)
        return new Error(error)
    }

    return true;
}

export async function PUT(request, {params}) {
    const req = await request.json()
    let res = await manageEventLineup({...req, event: params.id, lineup: params.lineup})
    return NextResponse.json(res)
}