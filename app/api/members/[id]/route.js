import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getOneMember = async (memberId) => {
    console.log({memberId})
    const supabase = createServerComponentClient({ cookies });

    const { data: [member], error } = await supabase
        .from('Member')
        .select(`
            *,
            EmailAddress ( * ),
            PhoneNumber ( * ),
            Address ( * ),
            EnsembleMembership ( 
                *,
                ensemble ( *, type (*))
            )`
        )
        .eq('id', memberId)

    if (error) {
        console.error("get member error:", error);
        return new Error(error);
    }

    // console.log("getOneMember:", member);
    return member;
}

export const updateOneMember = async (memberData) => {
    const { id, firstName, middleName, lastName, aka, suffix, birthday, sex, height, weight, race, ethnicity, hair, eyes } = memberData;
    const supabase = createServerComponentClient({ cookies });

    console.log("update member profile data:", memberData)

    const { data, error } = await supabase
        .from('Member')
        .update({
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            aka: aka,
            suffix: suffix,
            birthday: birthday ? new Date(birthday) : undefined,
            sex: sex ? parseInt(sex) : undefined,
            height: height ? parseInt(height) : undefined,
            weight: weight ? parseInt(weight) : undefined,
            race: race ? parseInt(race) : undefined,
            ethnicity: ethnicity,
            hair: hair ? parseInt(hair) : undefined,
            eyes: eyes ? parseInt(eyes) : undefined
        })
        .eq('id', id)
        .select()
    
    if (error) console.error("update member error:", error);
    if(data) console.log("update member data:", data)

    return data;
}

// fetch
export async function GET(request, { params }) {
    const { id } = params;
    // const req = await request.json()
    const res = await getOneMember(id)
    return NextResponse.json({ res })
}

// update
export async function PUT(request, { params }) {
    const id = params.id;
    const req = await request.json()
    const res = await updateOneMember({...req, id: id})
    return NextResponse.json({ res })
}