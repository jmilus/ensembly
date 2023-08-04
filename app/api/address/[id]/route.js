import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const updateOneAddress = async (data) => {
    const { id, street, street2, city, state, postalCode, type, memberId, eventId, modelId } = data;
    const supabase = createServerComponentClient({ cookies });

    console.log("upsert address data:", data)

    const { data: address, error } = await supabase
        .from('Address')
        .upsert({
            id: id === 'undefined' ? undefined : id,
            street,
            street2,
            city,
            state,
            postalCode,
            type,
            member: memberId,
            event: eventId,
            eventModel: modelId
        })
        .select()
    
    if (error) {
        console.error("upsert address error:", error);
        return new Error(error);
    }
    
    return address[0];
}

// upsert
export async function PUT(request, { params }) {
    const id = params.id;
    const req = await request.json()
    const res = await updateOneAddress({...req, id: id})
    return NextResponse.json({ res })
}