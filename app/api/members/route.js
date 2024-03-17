import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getAllMembers = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
        .from('Member')
        .select(`
        *,
        phonenumber:PhoneNumber!left(number),
        email:EmailAddress!left(email),
        address:Address!left(street, street2, city, state, postalCode, country, poBox)
        `)
        .eq('PhoneNumber.type', 'Primary')
        .eq('EmailAddress.type', 'Primary')
        .eq('Address.type', 'Home')
    
    if (error) console.error("fetch all members error:", error);
    // console.log("fetched all members:", data)

    return data;
}

export async function GET(request) {
    const req = await request.json()
    console.log("get all members:", { req })
    const res = await getAllMembers(req)
    return NextResponse.json({res})
}

//#########


export const createMember = async (memberData) => {
    const { firstName, middleName, lastName, suffix, aka, birthday, sex, height, weight, race, ethnicity, hair, eyes } = memberData;
    const supabase = createServerComponentClient({ cookies });

    const myAka = aka ? aka : `${firstName} ${lastName}`;

    const { data: member, error } = await supabase
        .from('Member')
        .insert([
            {
                firstName,
                middleName: middleName ? middleName : "",
                lastName,
                suffix: suffix ? suffix : "",
                aka: myAka,
                birthday,
                sex: sex ? sex : undefined,
                height: parseInt(height),
                weight: parseInt(weight),
                race: race ? race : undefined,
                ethnicity,
                hair: hair ? hair : undefined,
                eyes: eyes ? eyes : undefined
            }
        ])
        .select()
        .single()
    
    if (error) {
        console.error("create member error:", error)
        return new Error(error.message);
    }
    
    return member;
}

export async function POST(request) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createMember(req)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}