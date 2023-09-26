import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getAllMembers = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
        .from('Member')
        .select('*')
    
    if (error) console.error("fetch all members error:", error);
    // console.log("fetched all members:", data)

    return data;
}

export const createMember = async (memberData) => {
    const { firstName, middleName, lastName, suffix, aka, birthday, sex, height, weight, race, ethnicity, hair, eyes, email, phonenumber, street, street2, city, state, postalCode, country, poBox } = memberData;
    const supabase = createServerComponentClient({ cookies });

    const myAka = aka ? aka : `${firstName} ${lastName}`;

    const { data: member, error } = await supabase
        .from('Member')
        .insert([
            {
                firstName,
                middleName,
                lastName,
                suffix,
                aka: myAka,
                birthday,
                sex: parseInt(sex),
                height: parseInt(height),
                weight: parseInt(weight),
                race: parseInt(race),
                ethnicity,
                hair: parseInt(hair),
                eyes: parseInt(eyes)
            }
        ])
        .select()
    
    if (error) {
        console.error("create member error:", error)
        return new Error(error);
    }
    
    return member[0];
}

export async function GET(request) {
    const req = await request.json()
    console.log("get all members:", { req })
    const res = await getAllMembers()
    return NextResponse.json({res})
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createMember(req)
    return NextResponse.json({ res })
}