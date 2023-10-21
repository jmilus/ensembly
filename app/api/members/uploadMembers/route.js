import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

import { memberImportFromExcel } from 'utils/importFromExcel';


export const importMembers = async (data) => {
    const { ensembleId, members } = data;
    const supabase = createServerComponentClient({ cookies }); // address
    // console.log({ data })

    const importableData = await memberImportFromExcel(members);
    console.log({importableData})

    Promise.all(importableData.map(async importMember => {
        console.log({ importMember })
        const { data: newMember, error: memberError } = await supabase
            .from("Member").insert(importMember.bio).select().single();
        
        // console.log({newMember})
        if (newMember === null) return;
        
        if (memberError) {
            console.error(memberError)
            return {message: "member fail", }
        }
        
        if (importMember.email?.length > 0) {
            const { data: newEmail, error: emailError } = await supabase
                .from("EmailAddress").insert({ email: importMember.email, type: "Primary", member: newMember.id })
            if(emailError) console.error(emailError)
        }
        if (importMember.phonenumber?.length > 0) {
            const { data: newPhone, error: phoneError } = await supabase
                .from("PhoneNumber").insert({ number: importMember.phonenumber, type: "Primary", member: newMember.id })
            if(phoneError) console.error(phoneError)
        }
        if (Object.keys(importMember.address).length > 0) {
            const { data: newAddress, error: addressError } = await supabase
                .from("Address").insert({ ...importMember.address, type: "Home", member: newMember.id })
            if(addressError) console.error(addressError)
        }
        
        const insertMembershipAndDivision = async (ensemble) => {
            if (Object.keys(importMember.membership).length > 0) {
                const { data: memType, error: memTypeError } = await supabase.from("MembershipType").select("id").eq('name', importMember.membership.membershipType).single()
                if (memTypeError) return new Error('problem finding matching membership type:', memTypeError.message)
                console.log({ memType })
                const { data: newMembership, error: membershipError } = await supabase
                    .from("EnsembleMembership")
                    .insert({
                        ensemble: ensemble,
                        member: newMember.id,
                        status: "Active",
                        membership_type: memType.id,
                        membership_start: importMember.membership.membershipStart || new Date(),
                        membership_expires: importMember.membership.membershipExpires || null
                    })
                    .select()
                    .single()
                //
                console.log({newMembership}, {membershipError})
                if (membershipError) return new Error('problem inserting ensemble membership:', membershipError.message);
                if (newMembership === null) return;
                //
                if (importMember.division) {
                    const { data: primeLineup, error: lineupError } = await supabase.from("Lineup").select("id, name").eq('ensemble', ensemble).is('is_primary', true).single()
                    const { data: divisionId, error: divisionError } = await supabase.from("Division").select("id, name").eq('name', importMember.division).eq('ensemble', ensemble).single()
                    if (lineupError) return new Error('problem finding matching lineup:', lineupError.message);
                    if (divisionError) return new Error('problem finding matching division', divisionError.message);

                    console.log("creating assignment with", primeLineup.name, divisionId.name)
                    const { data: lineupAssignment, error: assignmentError } = await supabase
                        .from("LineupAssignment")
                        .insert({ lineup: primeLineup.id, membership: newMembership.id, division: divisionId.id })
                    //
                    if(assignmentError) console.error(assignmentError)
                }
            }
        }

        if (importMember.ensemble) {
            const { data: ensId, error: ensError } = await supabase.from("Ensemble").select("id").eq('name', importMember.ensemble).single();
            if (ensError) return new Error('problem finding matching ensemble:', ensError.message)
            console.log({ensId})
            insertMembershipAndDivision(ensId.id)
        } else if (ensembleId) {
            insertMembershipAndDivision(ensembleId)
        }

        return "success";
    }))

    return true;
}

export async function POST(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await importMembers(req)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}