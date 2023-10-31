import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneMember = async (memberId) => {
    console.log({memberId})
    const supabase = createServerComponentClient({ cookies });

    const { data: member, error } = await supabase
        .from('Member')
        .select(`
            *,
            EmailAddress ( * ),
            PhoneNumber ( * ),
            Address ( * ),
            EnsembleMembership ( 
                *,
                membership_type (*),
                ensemble ( *, ensemble_type:type (*)),
                assignments:LineupAssignment(
                    title,
                    Lineup (id, is_primary, name),
                    Division (id, name, capacity)
                )
            )`
        )
        .eq('id', memberId)

    if (error) {
        console.error("get member error:", error);
        return new Error(error);
    }

    // console.log("getOneMember:", member);
    return member[0];
}

// fetch
export async function GET({ params }) {
    const res = await getOneMember(params.id)
    return NextResponse.json({ res })
}

// ########


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
            sex: sex != '' ? sex : undefined,
            height: height ? parseInt(height) : undefined,
            weight: weight ? parseInt(weight) : undefined,
            race: race != '' ? race : undefined,
            ethnicity,
            hair: hair != '' ? hair : undefined,
            eyes: eyes != '' ? eyes : undefined
        })
        .eq('id', id)
        .select()
    
    if (error) console.error("update member error:", error);
    if(data) console.log("update member data:", data)

    return data;
}

// update
export async function PUT(request, { params }) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await updateOneMember({...req, id: params.id})
    return NextResponse.json({ res })
}
