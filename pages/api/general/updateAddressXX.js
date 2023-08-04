import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const updateOneAddress = async (addressData) => {
    const { id, street, street2, city, state, postalCode, rank, memberId, eventId, modelId } = addressData;
    const supabase = createServerComponentClient({ cookies });
    
    console.log("upsert address data:", addressData)
    const upsertAddress = {
        id: id || "new",
        street: street,
        street2: street2,
        city: city,
        state: state,
        postalCode: postalCode,
        rank: rank,
        member: memberId,
        event: eventId,
        eventModel: modelId
    }

    const { data, error } = await supabase
        .from('Address')
        .upsert({ upsertAddress })
    
    if (error) console.log("upsert address error:", error);
    
    console.log("physical address:", {data});
    return;
}

const updateAddress = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneAddress(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateAddress;