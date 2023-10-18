import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

import { memberImportFromExcel } from 'utils/importFromExcel';


export const importMembermbers = async (data) => {
    const { ensembleId, members } = data;
    const supabase = createServerComponentClient({ cookies });
    // console.log({ data })

    const importableData = await memberImportFromExcel(members);
    console.log({ importableData }, importableData[0].bio, importableData[1].address)

    Promise.all(importableData.map(async importMember => {
        console.log({ importMember })
        const { data: newMembers, error: memberError } = await supabase
            .from("Member").insert(importMember.bio).select();
        
        // console.log({newMembers})
        if (newMembers.length === 0) return;

        const newMember = newMembers[0]
        
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
                const { data: memType, error: memTypeError } = await supabase.from("MembershipType").select("id").eq('name', importMember.membership.membershipType)
                const { data: newMembership, error: membershipError } = await supabase
                    .from("EnsembleMembership")
                    .insert({
                        ensemble: ensemble,
                        member: newMember.id,
                        status: "Active",
                        membership_type: memType[0].id,
                        membership_start: importMember.membership.membershipStart || new Date()
                    })
                    .select()
                //
                if (membershipError) console.error(membershipError);
                if (newMembership.length === 0) return;
                console.log({newMembership})
                //
                if (importMember.division) {
                    const { data: primeLineup, error: lineupError } = await supabase.from("Lineup").select("id").eq('ensemble', ensemble).is('is_primary', true)
                    const { data: divisionId, error: divisionError } = await supabase.from("Division").select("id").eq('name', importMember.division)
                    const { data: lineupAssignment, error: assignmentError } = await supabase
                        .from("LineupAssignment")
                        .insert({ lineup: primeLineup[0].id, membership: newMembership[0].id, division: divisionId[0].id })
                    //
                    if(assignmentError) console.error(assignmentError)
                }
            }
        }

        if (importMember.ensemble) {
            const { data: ensId, error: ensError } = await supabase.from("Ensemble").select("id").eq('name', importMember.ensemble);
            insertMembershipAndDivision(ensId[0].id)
        } else if (ensembleId) {
            insertMembershipAndDivision(ensembleId)
        }

        return "success"
    }))

    return true;
}

export async function POST(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await importMembermbers(req)
    return NextResponse.json({ res })
}