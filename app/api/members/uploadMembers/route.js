import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

import { updateOneMember } from '../[id]/route';

import _ from 'lodash';

import { memberImportFromExcel } from 'utils/importFromExcel'; // warnings


const importMember = async (data) => {
    const supabase = createServerComponentClient({ cookies });
    let { data: existingMember, error: existingMemberError } = await supabase
        .from("Member")
        .select()
        .eq('firstName', data.firstName || "")
        .eq('middleName', data.middleName || "")
        .eq('lastName', data.lastName || "")
        .eq('suffix', data.suffix || "")
    
    if (existingMemberError) {
        console.error("there was a problem fetching the member:", existingMemberError)
        return new Error(`fetch member error: ${existingMemberError}`)
    }
    
    if (!_.isEmpty(existingMember)) {
        console.log("member exists", existingMember);
        let updatedMember = await updateOneMember({ ...data, id: existingMember[0].id })
        updatedMember.warnings = ["firstName", "middleName", "lastName", "suffix"]
        updatedMember.alerts = []
        return updatedMember
    } 

    // -------------- no matching members found -----------------
    
    const { data: newMember, error: newMemberError } = await supabase
            .from("Member").insert(data).select();
        
    if (newMemberError) {
        console.error("there was a problem creating a member from the upload:", newMemberError.message)
        return new Error(`insert member error: ${newMemberError.message}`)
    }

    // console.log({ newMember })

    return { ...newMember[0], warnings: [], alerts: [] };
}

const importEmail = async (email, memberId) => {
    if (email === null || email === undefined ||  email === "") return "";
    const supabase = createServerComponentClient({ cookies });

    let { data: existingEmail, error: existingEmailError } = await supabase
        .from("EmailAddress").select().eq('email', email).eq('member', memberId);
    
    console.log({existingEmail})
    
    if (!_.isEmpty(existingEmail)) return existingEmail[0]

    // --------------- no matching emails found -------------------

    const { data: newEmail, error: emailError } = await supabase
        .from("EmailAddress").insert({ email: email, type: "Primary", member: memberId }).select()
    
    if (emailError) {
        console.error("there was a problem creating a new email:", emailError.message)
        return "";
    }

    console.log({newEmail})

    return newEmail[0]
}

const importPhone = async (phone, memberId) => {
    console.log("phone value:", phone)
    if (phone === null || phone === undefined || phone === "") return "";
    const supabase = createServerComponentClient({ cookies });

    let { data: existingPhone, error: existingPhoneError } = await supabase
        .from("PhoneAddress").select().eq('phone', phone).eq('member', memberId);
    
    if (existingPhone !== null) return existingPhone[0]

    // --------------- no matching phones found -------------------

    const { data: newPhone, error: phoneError } = await supabase
        .from("PhoneAddress").insert({ phonenumber: phone, type: "Primary", member: memberId }).select()
    
    if (phoneError) {
        console.error("there was a problem creating a new phone:", phoneError)
        return "";
    }

    return newPhone[0]
}

const importAddress = async (address, memberId) => {
    if (_.isEmpty(address)) return {}
    const isEmpty = Object.keys(address).every(a => {
        return address[a] === "" || address[a] === undefined || address[a] === null
    })
    if (isEmpty) return {alerts: [], warnings: []}

    const supabase = createServerComponentClient({ cookies });

    const { data: newAddress, error: addressError } = await supabase
        .from("Address").insert({ ...address, type: "Home", member: memberId }).select()
    
    if (addressError) {
        console.error("there was a problem creating a new address:", addressError.message)
        return Error(addressError.message);
    }

    return { ...newAddress[0], alerts: [], warnings: [] }
}

const insertMembership = async (membership, ensembleId, memberId) => {
    let thisMembership = { alerts: [], warnings: [] }
    if (membership.membershipType) {
        const supabase = createServerComponentClient({ cookies });

        console.log("adding membership")
        const { data: memType, error: memTypeError } = await supabase
            .from("MembershipType")
            .select("id, name")
            .eq('name', membership.membershipType)
        //
        if (memTypeError || _.isEmpty(memType)) {
            console.error('problem finding matching membership type:', memTypeError)
            thisMembership = { ...membership }
            thisMembership.alerts = ["membershipType"]
            return thisMembership;
        }
        console.log({ memType })

        const { data: existingMembership, error: existingMembershipError } = await supabase
            .from("EnsembleMembership")
            .select()
            .eq('member', memberId)
            .eq('membership_type', memType[0].id)
            .eq('ensemble', ensembleId)
            .eq('status', "Active")
        
        console.log({ existingMembership }, { existingMembershipError })

        if (existingMembershipError) {
            console.error("there was a problem fetching a matching membership:", existingMembershipError.message)
            return Error(existingMembershipError.message);
        }

        //
        if (_.isEmpty(existingMembership)) {
            const { data: newMembership, error: membershipError } = await supabase
                .from("EnsembleMembership")
                .insert({
                    ensemble: ensembleId,
                    member: memberId,
                    status: "Active",
                    membership_type: memType[0].id,
                    membership_start: membership.membershipStart || new Date(),
                    membership_expires: membership.membershipExpires || null
                })
                .select()
            
            console.log({ newMembership }, { membershipError })
            
            //
            if (membershipError || newMembership.length === 0) {
                console.error('problem inserting ensemble a new membership:', membershipError?.message);
                thisMembership.alerts.push("membership")
                return thisMembership;
            }
            
            thisMembership = { ...thisMembership, ...newMembership[0] }
        } else {
            thisMembership = { ...thisMembership, ...existingMembership[0] }
        }
        
        thisMembership.type = memType[0].name
        //
        return thisMembership;
    }

    return {}
}

const insertAssignment = async (division, ensembleId, membershipId) => {
    console.log({ division }, { ensembleId }, { membershipId })
    let thisAssignment = { alerts: [], warnings: [] }
    if (division) {
        const supabase = createServerComponentClient({ cookies });

        const { data: primeLineup, error: lineupError } = await supabase.from("Lineup").select("id, name").eq('ensemble', ensembleId).is('is_primary', true)

        if (lineupError || primeLineup.length === 0) {
            return new Error('problem finding primary lineup:', lineupError);
        }
        
        const { data: existingDivision, error: existingDivisionError } = await supabase.from("Division").select("id, name").eq('name', division).eq('ensemble', ensembleId)
        
        if (existingDivisionError || existingDivision.length === 0) {
            console.error('problem finding matching division for', division, existingDivisionError);
            thisAssignment.alerts.push("division")
            return thisAssignment;
        }

        const { data: existingAssignment, error: existingAssignmentError } = await supabase
            .from("LineupAssignment")
            .select()
            .eq('lineup', primeLineup[0].id)
            .eq('membership', membershipId)
            .eq('division', existingDivision[0].id)
        
        if (existingAssignmentError) {
            console.error(`problem checking for an existing assignment for membership ${membershipId} to division ${division}`, existingAssignmentError)
            return thisAssignment;
        }
        if (existingAssignment.length > 0)
            return { ...thisAssignment, ...existingAssignment[0] }

        console.log("creating assignment with", primeLineup[0].name, existingDivision[0].name)
        const { data: lineupAssignment, error: assignmentError } = await supabase
            .from("LineupAssignment")
            .insert({ lineup: primeLineup[0].id, membership: membershipId, division: existingDivision[0].id })
            .select()
        
        //
        if (assignmentError) {
            return new Error(`trouble creating prime lineup assignment: ${assignmentError}`); // returnedMember
        }
        thisAssignment = {...thisAssignment, ...lineupAssignment[0]}
    }

    return thisAssignment;
}


export const importHandler = async (data) => {
    const { ensembleId, members } = data;
    const supabase = createServerComponentClient({ cookies });
    console.log({ data })

    // const importableData = await memberImportFromExcel(members);
    // console.log({importableData})

    const importResult = await Promise.all(members.map(async importRecord => {
        console.log({ importRecord })
        let thisMember = { alerts: [], warnings: [] }

        //
        const returnedMember = await importMember(importRecord.bio);
        if (returnedMember instanceof Error) return returnedMember;
        thisMember.bio = returnedMember;
        thisMember.warnings = [...thisMember.warnings, ...returnedMember.warnings]
        thisMember.alerts = [...thisMember.alerts, ...returnedMember.alerts]

        //
        const memberEmail = await importEmail(importRecord.email, thisMember.bio.id);
        thisMember.email = memberEmail;
        thisMember.warnings = [...thisMember.warnings, "email"]
        thisMember.alerts = [...thisMember.alerts, "email"]
        
        //
        const memberPhone = await importPhone(importRecord.phonenumber, thisMember.bio.id);
        thisMember.phone = memberPhone;
        thisMember.warnings = [...thisMember.warnings, "phonenumber"]
        thisMember.alerts = [...thisMember.alerts, "phonenumber"]
        
        //
        const memberAddress = await importAddress(importRecord.address, thisMember.bio.id);
        if (memberAddress instanceof Error) return thisMember;
        thisMember.address = memberAddress;
        thisMember.warnings = [...thisMember.warnings, ...memberAddress.warnings]
        thisMember.alerts = [...thisMember.alerts, ...memberAddress.alerts]

        //
        if (_.isEmpty(importRecord.membership)) return thisMember;


        //
        let thisMembership = {}
        if (importRecord.ensemble) {
            const { data: ensId, error: ensError } = await supabase.from("Ensemble").select("id").eq('name', importRecord.ensemble);
            if (ensError || ensId.length === 0) {
                console.error(`problem finding matching ensemble: ${ensError}`)
                thisMember.alerts.push("ensemble")
                
            } else {
                console.log({ensId})
                thisMembership = await insertMembership(importRecord.membership, ensId[0].id, thisMember.bio.id)
            }

        } else if (ensembleId) {
            thisMembership = await insertMembership(importRecord.membership, ensembleId, thisMember.bio.id)

        }
        thisMembership.ensemble = importRecord.ensemble;
        thisMember.membership = thisMembership
        thisMember.warnings = [...thisMember.warnings, ...thisMembership.warnings]
        thisMember.alerts = [...thisMember.alerts, ...thisMembership.alerts]

        if (!_.isEmpty(thisMembership)) {
            const assignment = await insertAssignment(importRecord.division, ensembleId, thisMembership.id)
            console.log("here's the assignment we landed on:", assignment)
            thisMember.assignment = assignment
            thisMember.assignment.division = importRecord.division
            thisMember.warnings = [...thisMember.warnings, ...assignment.warnings]
            thisMember.alerts = [...thisMember.alerts, ...assignment.alerts]
        }

        //
        return thisMember;
    }))

    return importResult;
}

export async function POST(request) {
    // const _req = await request.formData();
    // const req = extractFields(_req);
    const req = await request.json();
    const res = await importHandler(req)
    if (res instanceof Error) return NextResponse.json({ error: res?.message }, { status: 400 })
    return NextResponse.json(res)
}

export async function PUT(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    // const req = await request.json();
    const res = await importHandler(req)
    if (res instanceof Error) return NextResponse.json({ error: res?.message }, { status: 400 })
    return NextResponse.json(res)
}