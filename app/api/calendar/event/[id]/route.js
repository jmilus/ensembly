import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneEvent = async (id) => {
    const supabase = createClient();

    const { data: event, error } = await supabase
        .from('Event')
        .select(`
            *,
            model:EventModel (*, EventType (*), address: Address (*), parent (*)),
            lineups:Lineup (
                *, 
                assignments:LineupAssignment (
                    EnsembleMembership (
                        id,
                        Member (*)
                    ),
                    Division (*)
                )
            ),
            address: Address (*),
            Attendance (*)
        `)
        .eq('id', id)

    if (error) {
        console.error("get event error:", error);
        return new Error(error);
    }

    // console.log("getOneEvent:", event);
    return event[0];
}

// fetch
export async function GET(request, { params }) {
    const res = await getOneEvent(params.id)
    return NextResponse.json({ res })
}

// #######

export const updateOneEvent = async (data) => {
    const { id, eventStartDate, eventEndDate, note } = data;
    const supabase = createClient();

    console.log("update event profile data:", data)

    let updateObj = {};
    Object.keys(data).forEach(key => {
        const value = data[key]
        if (value !== undefined) {

            if (key === "eventStartDate" || key === "eventEndDate") {
                updateObj[key] = new Date(value);
            } else {
                updateObj[key] = value;
            }
        }
    })
    console.log({updateObj})

    const { data: event, error } = await supabase
        .from('Event')
        .update(updateObj)
        .eq('id', id)
        .select()
    
    if (error) {
        console.error("update event error:", error);
        return new Error(error);
    }

    // console.log("update event data:", event)

    return event[0];
}

// update
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneEvent({...req, id: params.id})
    return NextResponse.json({ res })
}

// #######
