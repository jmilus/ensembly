import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

import _ from 'lodash';

const importMember = async (member) => {
    const supabase = createClient();

    const {
        id,
        firstName,
        middleName,
        lastName,
        suffix,
        aka,
        birthday,
        sex,
        height,
        weight,
        race,
        ethnicity,
        hair,
        eyes
    } = member;
    
    const { data: newMember, error: newMemberError } = await supabase
        .from("Member").upsert({
            id: id === "new" ? undefined : id,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            suffix: suffix,
            aka: aka ? aka : `${firstName} ${lastName} ${suffix || ""}`,
            birthday: birthday,
            sex: sex,
            height: parseInt(height),
            weight: parseInt(weight),
            race: race,
            ethnicity: ethnicity,
            hair: hair,
            eyes: eyes
        }).select();
        
    if (newMemberError) {
        console.error("there was a problem creating a member from the upload:", newMemberError.message)
        return new Error(`insert member error: ${newMemberError.message}`)
    }

    // console.log({ newMember })

    return newMember[0];
}

const importEmail = async (email, memberId) => {
    if (email === null || email === undefined ||  email === "") return "";
    const supabase = createClient();

    // let { data: existingEmail, error: existingEmailError } = await supabase
    //     .from("EmailAddress").select().eq('email', email).eq('member', memberId);
    
    // console.log({existingEmail})
    
    // if (!_.isEmpty(existingEmail)) return existingEmail[0]

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
    console.log("phone value:", phone, memberId)
    if (phone === null || phone === undefined || phone === "") return "";
    const supabase = createClient();

    // let { data: existingPhone, error: existingPhoneError } = await supabase
    //     .from("PhoneAddress").select().eq('phone', phone).eq('member', memberId);
    
    // if (existingPhone !== null) return existingPhone[0]

    // --------------- no matching phones found -------------------

    const { data: newPhone, error: phoneError } = await supabase
        .from("PhoneNumber").insert({ number: phone, type: "Primary", member: memberId }).select()
    
    if (phoneError) {
        console.error("there was a problem creating a new phone:", phoneError.message)
        return "";
    }

    return newPhone[0]
}

const importAddress = async (member) => {
    const {
        id,
        street,
        street2,
        city,
        state,
        postalCode,
        country,
        poBox,
        addressType
    } = member;

    if (!city && !street || !poBox) return {}

    let thisAddressType = addressType || "Home"

    const supabase = createClient();

    const { data: existingAddress, error: existingAddressErr } = await supabase
        .from("Address")
        .select('id')
        .eq('member', id)
        .eq('type', thisAddressType)
    
    console.log({existingAddress}, {existingAddressErr})

    if (existingAddressErr) thisAddressType = 'new'

    const { data: newAddress, error: addressError } = await supabase
        .from("Address").insert({
            id: existingAddress,
            member: id,
            street,
            street2,
            city,
            state,
            postalCode,
            country,
            poBox,
            type: thisAddressType
        }).select()
    
    if (addressError) {
        console.error("there was a problem creating a new address:", addressError.message)
        return Error(addressError.message);
    }

    return newAddress[0]
}

const insertMembership = async (member, ensembleId, memberId) => {
    console.log(member, ensembleId, memberId)
    if (member.membershipType) {
        const supabase = createClient();

        console.log("adding membership")
        const { data: memType, error: memTypeError } = await supabase
            .from("MembershipType")
            .select("id, name")
            .eq('name', member.membershipType)
        //
        if (memTypeError || _.isEmpty(memType)) {
            console.error('problem finding matching membership type:', memTypeError)
            return memTypeError;
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
        const membershipToInsert = {
            ensemble: ensembleId,
            member: memberId,
            status: "Active",
            membership_type: memType[0].id,
            membership_start: member.membershipStart != "" ? new Date(member.membershipStart) : new Date()
        }
        if (member.membershipExpires && member.membershipExpires != "") {
            membershipToInsert['membership_expires'] = new Date(member.membershipExpires)
        }

        if (_.isEmpty(existingMembership)) {
            console.log({membershipToInsert})
            
            const { data: newMembership, error: membershipError } = await supabase
                .from("EnsembleMembership")
                .insert(membershipToInsert)
                .select()
            
            console.log({ newMembership }, { membershipError })
            
            //
            if (membershipError || newMembership.length === 0) {
                console.log(member.membershipStart)
                console.error('problem inserting a new membership:', membershipError?.message);
                return new Error(membershipError?.message);
            }
            
            return newMembership[0]
        } else {
            return existingMembership[0]
        }
    
    }

    return {}
}

const insertAssignment = async (division, ensembleId, membershipId) => {
    console.log({ division }, { ensembleId }, { membershipId })
    if (division) {
        const supabase = createClient();

        const { data: primeLineup, error: lineupError } = await supabase
            .from("Lineup")
            .select("id, name")
            .eq('ensemble', ensembleId)
            .is('is_primary', true)

        if (lineupError || primeLineup.length === 0) {
            return new Error('problem finding primary lineup:', lineupError);
        }
        
        const { data: existingDivision, error: existingDivisionError } = await supabase
            .from("Division").select("id, name").eq('name', division).eq('ensemble', ensembleId)
        
        if (existingDivisionError || existingDivision.length === 0) {
            console.error('problem finding matching division for', division, existingDivisionError);
            return new Error(existingDivisionError.message);
        }

        const { data: existingAssignment, error: existingAssignmentError } = await supabase
            .from("LineupAssignment")
            .select()
            .eq('lineup', primeLineup[0].id)
            .eq('membership', membershipId)
            .eq('division', existingDivision[0].id)
        
        if (existingAssignmentError) {
            console.error(`problem checking for an existing assignment for membership ${membershipId} to division ${division}`, existingAssignmentError)
            return new Error(`problem checking for an existing assignment for membership ${membershipId} to division ${division}: ${existingAssignmentError.message}`);
        }
        if (existingAssignment.length > 0) return existingAssignment[0]

        console.log("creating assignment with", primeLineup[0].name, existingDivision[0].name)
        const { data: lineupAssignment, error: assignmentError } = await supabase
            .from("LineupAssignment")
            .insert({ lineup: primeLineup[0].id, membership: membershipId, division: existingDivision[0].id })
            .select()
        
        //
        if (assignmentError) {
            return new Error(`trouble creating prime lineup assignment: ${assignmentError}`); // returnedMember
        }
        return lineupAssignment[0]
    }

}


export const importHandler = async (members) => {
    // console.log({ members })
    // return true;

    const supabase = createClient();

    // const importableData = await memberImportFromExcel(members);
    // console.log({importableData})

    const importResult = await Promise.all(members.map(async member => {
        // console.log({ member })
        let thisMember = { }

        //
        const returnedMember = await importMember(member);
        console.log({returnedMember})
        if (returnedMember instanceof Error) return returnedMember;
        thisMember = { ...returnedMember }
        //

        let memberEmail;
        if (member.email) memberEmail = await importEmail(member.email, returnedMember.id);
        thisMember.email = memberEmail

        //
        let memberPhone;
        if (member.phonenumber) memberPhone = await importPhone(member.phonenumber, returnedMember.id);
        thisMember.phonenumber = memberPhone

        //
        let memberAddress;
        if (member.street ||
            member.street2 ||
            member.city ||
            member.state ||
            member.postalCode ||
            member.country ||
            member.poBox)
            memberAddress = await importAddress(member);
            // if (memberAddress instanceof Error) return thisMember;
        thisMember.address = memberAddress;

        //
        let thisMembership = {}
        const { data: ensembleId, error: ensembleError } = await supabase
            .from("Ensemble").select("id").eq('name', member.ensemble);
        
        if (ensembleError) {
            console.error(`problem finding matching ensemble: ${ensembleError.message}`)   
        }
        thisMembership = await insertMembership(member, ensembleId[0].id, returnedMember.id)

        thisMember.membership = thisMembership

        if (!member.division) return thisMember

        if (!_.isEmpty(thisMembership)) {
            const assignment = await insertAssignment(member.division, ensembleId[0].id, thisMembership.id)
            // console.log("here's the assignment we landed on:", assignment)
            thisMember.assignment = assignment
            thisMember.assignment.division = member.division
        }

        //
        return thisMember;
    }))

    console.log({importResult})

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