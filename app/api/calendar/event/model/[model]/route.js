import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneEventModel = async (id) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: eventModel, error } = await supabase
        .from('EventModel')
        .select(`
            *,
            type:EventType (*),
            events:Event (
                *, 
                lineups:Lineup (
                    *,
                    assignments:LineupAssignment (
                        EnsembleMembership (
                            id,
                            Member (*)
                        ),
                        Division (*)
                    )
                )
            ),
            address:Address (*)
        `)
        .eq('id', id)
    
    if (error) {
        console.error("fetch one eventModel error:", error);
        return new Error(error)
    }

    return eventModel[0];
}

export async function GET(request, { params }) {
    const req = await request.json()
    const res = await getOneEventModel({...req, model: params.model})
    return NextResponse.json({ res })
}

// #######

export const updateOneEventModel = async (data) => {
    const supabase = createServerComponentClient({ cookies });

    console.log("update model data:", { data })

    let updateObj = {}
    Object.keys(data).forEach(key => {
        const value = data[key]
        if (value !== undefined) {
            
            if (key === "modelStartDate" || key === "modelEndDate") {
                updateObj[key] = new Date(value);
            } else if (key === "occurrence") {
                updateObj[key] = Array.isArray(value) ? value : [value]
            } else {
                updateObj[key] = value;
            }
        }
    })

    console.log({updateObj})

    const { data: model, error } = await supabase
        .from('EventModel')
        .update(updateObj)
        .eq('id', data.id)
        .select()
        .single()
    
    if (error) {
        console.error("update one eventModel error:", error);
        return new Error(error)
    }

    return model

}

export async function PUT(request, { params }) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await updateOneEventModel({...req, id: params.model})
    return NextResponse.json(res)
}

// #####

export const createEvent = async (data) => {
    console.log("new event data:", { data })
    const { model, eventStartDate, eventEndDate, eventName, type, exception=false } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: newEvent, error } = await supabase.from('Event').insert({
        anchorDate: new Date(eventStartDate).toLocaleDateString(),
        eventStartDate: new Date(eventStartDate),
        eventEndDate: new Date(eventEndDate),
        name: eventName || null,
        type: type,
        exception,
        model: model
    })

    if (error) {
        console.error("create one event error:", error);
        return new Error(error)
    }
    console.log("created one event:", newEvent)

    return true;

}

export async function POST(request, { params }) {
    console.log("POST:", params)
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await createEvent({...req, model: params.model})
    return NextResponse.json({res})
}