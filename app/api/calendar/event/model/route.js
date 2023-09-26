import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getManyEventModels = async (params) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: eventModels, error } = await supabase
        .from('EventModel')
        .select()
        .match(params)
    
    if (error) {
        console.log("fetch many models error:", error)
        return new Error(error);
    }

    return eventModels;
}

export const createEventModel = async ({ modelName, modelStartDate, modelEndDate, type, parent }) => {
    const supabase = createServerComponentClient({ cookies });

    console.log("create Model Event:", { modelName }, { modelStartDate }, { modelEndDate }, { type }, { parent })
    
    const { data: eventModel, error } = await supabase
        .from('EventModel')
        .insert([
            {
                name: modelName,
                modelStartDate: new Date(modelStartDate).toISOString(),
                modelEndDate: new Date(modelEndDate).toISOString(),
                type,
                parent
            }
        ])
        .select()
    
    if (error) {
        console.error("create new Model error:", error)
        return new Error(error);
    }

    return eventModel[0];
}

export async function GET(request) {
    const req = await request.json()
    const res = await getManyEventModels(req)
    return NextResponse.json({res})
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createEventModel(req)
    return NextResponse.json({res})
}