import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneEventModel = async (id) => {
    const supabase = createClient();

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
        .single()
    
    if (error) {
        console.error("fetch one eventModel error:", error);
        return new Error(error)
    }

    return eventModel;
}

export async function GET(request, { params }) {
    const req = await request.json()
    const res = await getOneEventModel({ ...req, model: params.model })
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}

// #######

export const updateOneEventModel = async (data) => {
    const supabase = createClient();

    console.log("update model data:", { data })

    let updateObj = {}
    Object.keys(data).forEach(key => {
        const value = data[key]
        if (value !== undefined) {
            
            if (key === "modelStartDate" || key === "modelEndDate") {
                updateObj[key] = new Date(value).toISOString();
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

export const createModelEvent = async (data) => {
    console.log("new event data:", { data })
    const { model, eventStartDate, eventEndDate, eventName, exception=false } = data;
    const supabase = createClient();

    const { data: newEvent, error } = await supabase
        .from('Event')
        .insert({
            anchorDate: new Date(eventStartDate).toLocaleDateString(),
            eventStartDate: new Date(eventStartDate).toISOString(),
            eventEndDate: new Date(eventEndDate).toISOString(),
            name: eventName || null,
            exception,
            model: model
        })
        .select().single()

    if (error) {
        console.error("create one event error:", error);
        return new Error(error)
    }
    // console.log("created one event:", newEvent)

    return newEvent;

}

export async function POST(request, { params }) {
    console.log("POST:", params)
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await createModelEvent({ ...req, model: params.model })
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json({res})
}