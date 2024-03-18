import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneAddress = async (id) => {
    const supabase = createClient();

    const { data: address, error } = await supabase
        .from("Address")
        .select()
        .eq('id', id)
        .maybeSingle()
    
    if (error) {
        console.log("get one Address error:", error);
        return new Error(error);
    }

    return address;
}

export async function GET(request, { params }) {
    if (params.id === null) return NextResponse.json(null)
    const res = await getOneAddress(params.id)
    return NextResponse.json(res)
}

// ######

export const updateOneAddress = async (data) => {
    const { id, street, street2, city, state, postalCode, type, memberId, event, model } = data;
    const supabase = createClient();

    console.log("upsert address data:", data)

    const { data: address, error } = await supabase
        .from('Address')
        .upsert({
            id: id === 'new' ? undefined : id,
            street,
            street2,
            city,
            state,
            postalCode,
            type,
            member: memberId
        })
        .select()
        .single()
    
    if (error) {
        console.error("upsert address error:", error);
        return new Error(error);
    }

    if (event) {
        const { data: updatedEvent, error: eventError } = await supabase.from("Event").update({ address: address.id }).eq('id', event)
        if (eventError) {
            console.error("updating event address error:", eventError)
            return new Error(eventError)
        }
    }
    
    if (model) {
        const { data: updatedModel, error: modelError } = await supabase.from("EventModel").update({ address: address.id }).eq('id', model)
        if (modelError) {
            console.error("updating model address error:", modelError)
            return new Error(modelError)
        }
    }
    
    return address;
}

// upsert
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneAddress({...req, id: params.id})
    return NextResponse.json({ res })
}

// ####


export const deleteAddress = async (id) => {
    const supabase = createClient();

    const { data: address, error } = await supabase
        .from('Address')
        .delete()
        .eq('id', id)
    
    if (error) {
        console.error("delete address error:", error);
        return new Error(error);
    }
    
    return address;
}

export async function DELETE(request, { params }) {
    const res = await deleteAddress(params.id)
    return NextResponse.json({ res })
}