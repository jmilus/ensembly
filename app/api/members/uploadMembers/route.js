import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

import { memberImportFromExcel } from 'utils/importFromExcel';


export const importMembers = async (data) => {
    const { ensembleId, members } = data;
    const supabase = createServerComponentClient({ cookies }); // address
    const exceptions = []
    // console.log({ data })

    const importableData = await memberImportFromExcel(members);
    console.log({importableData})

    const importResult = Promise.all(importableData.map(async importMember => {
        console.log({ importMember })
        const exceptionRecord = { ...importMember, exceptions: [] }
        const { data: newMember, error: memberError } = await supabase
            .from("Member").insert(importMember.bio).select().single();
        
        console.log({ newMember })
        if (memberError) {
            console.error("there was a problem creating a member from the upload:", memberError)
            return new Error(`upload member error: ${memberError}`)
        }
        if (newMember === null) return;
        
        if (importMember.email?.length > 0) {
            const { data: newEmail, error: emailError } = await supabase
                .from("EmailAddress").insert({ email: importMember.email, type: "Primary", member: newMember.id })
            if (emailError) {
                console.error(emailError)
                exceptionRecord.exceptions.push("email")
            }
        }
        if (importMember.phonenumber?.length > 0) {
            const { data: newPhone, error: phoneError } = await supabase
                .from("PhoneNumber").insert({ number: importMember.phonenumber, type: "Primary", member: newMember.id })
            if (phoneError) {
                console.error(phoneError)
                exceptionRecord.exceptions.push("phone")
            }
        }
        if (Object.keys(importMember.address).length > 0) {
            const { data: newAddress, error: addressError } = await supabase
                .from("Address").insert({ ...importMember.address, type: "Home", member: newMember.id })
            if (addressError) {
                console.error(addressError)
                exceptionRecord.exceptions.push("address")
            }
        }
        
        const insertMembershipAndDivision = async (ensemble) => {
            console.log({importMember})
            if (importMember?.membership?.membershipType) {
                console.log("adding membership")
                const { data: memType, error: memTypeError } = await supabase.from("MembershipType").select("id").eq('name', importMember.membership.membershipType)
                if (memTypeError || memType.length === 0) {
                    console.error('problem finding matching membership type:', memTypeError?.message)
                    exceptionRecord.exceptions.push("membershipType")
                    return;
                }
                console.log({ memType })
                //
                const { data: newMembership, error: membershipError } = await supabase
                    .from("EnsembleMembership")
                    .insert({
                        ensemble: ensemble,
                        member: newMember.id,
                        status: "Active",
                        membership_type: memType[0].id,
                        membership_start: importMember.membership.membershipStart || new Date(),
                        membership_expires: importMember.membership.membershipExpires || null
                    })
                    .select()
                    //
                    console.log({newMembership}, {membershipError})
                if (membershipError || newMembership.length === 0) {
                    console.error('problem inserting ensemble membership:', membershipError?.message);
                    exceptionRecord.exceptions.push("membership")
                    return;
                }
                //
                if (importMember.division) {
                    const { data: primeLineup, error: lineupError } = await supabase.from("Lineup").select("id, name").eq('ensemble', ensemble).is('is_primary', true)
                    const { data: divisionId, error: divisionError } = await supabase.from("Division").select("id, name").eq('name', importMember.division).eq('ensemble', ensemble)
                    if (lineupError || primeLineup.length === 0) return new Error('problem finding matching lineup:', lineupError?.message);
                    if (divisionError || divisionId.length === 0) {
                        console.error('problem finding matching division', divisionError?.message);
                        exceptionRecord.exceptions.push("division")
                        return;
                    }

                    console.log("creating assignment with", primeLineup[0].name, divisionId[0].name)
                    const { data: lineupAssignment, error: assignmentError } = await supabase
                        .from("LineupAssignment")
                        .insert({ lineup: primeLineup[0].id, membership: newMembership[0].id, division: divisionId[0].id })
                    //
                    if (assignmentError) return new Error(`trouble creating prime lineup assignment: ${assignmentError?.message}`);
                }
            }
        }

        if (importMember.ensemble) {
            console.log("importMember ensemble")
            const { data: ensId, error: ensError } = await supabase.from("Ensemble").select("id").eq('name', importMember.ensemble);
            if (ensError || ensId.length === 0) {
                console.error(`problem finding matching ensemble: ${ensError?.message}`)
                exceptionRecord.exceptions.push("ensemble")
                
            } else {
                console.log({ensId})
                insertMembershipAndDivision(ensId[0].id)
            }
        } else if (ensembleId) {
            console.log("ensembleId")
            insertMembershipAndDivision(ensembleId)
        }

        if (exceptionRecord.exceptions.length > 0) return exceptionRecord;
        return "success";
    }))

    return importResult;
}

export async function POST(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await importMembers(req)
    if (res instanceof Error) return NextResponse.json({ error: res?.message }, { status: 400 })
    return NextResponse.json(res)
}