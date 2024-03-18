import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getManyEventModels = async (props) => {
    const supabase = createClient();

    console.log({ props })

    const { data: eventModels, error } = await supabase
        .from('EventModel')
        .select(`
            *,
            type:EventType (*)
        `)
        .match(props)
    
    if (error) {
        console.log("fetch many models error:", error)
        return new Error(error);
    }

    return eventModels;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getManyEventModels(req)
    return NextResponse.json({res})
}

// ##################


export const createEventModel = async ({ modelName, modelStartDate, modelEndDate, type, parent }) => {
    const supabase = createClient();

    console.log("create Model Event:", { modelName }, { modelStartDate }, { modelEndDate }, { type }, { parent })
    
    const { data: eventModel, error } = await supabase
        .from('EventModel')
        .insert({
            name: modelName,
            modelStartDate: new Date(modelStartDate).toISOString(),
            modelEndDate: new Date(modelEndDate).toISOString(),
            type,
            parent: parent || null
        })
        .select()
        .single()
    
    if (error) {
        console.error("create new Model error:", error)
        return new Error(error);
    }

    return eventModel;
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createEventModel(req)
    console.log("error code:", res.code)
    return NextResponse.json(res)

}