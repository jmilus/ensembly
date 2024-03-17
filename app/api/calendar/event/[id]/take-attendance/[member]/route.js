import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getAttendance = async ({event, member}) => {
    const supabase = createServerComponentClient({ cookies });

    let matchValues = {}
    if (event) matchValues.event = event
    if (member) matchValues.member = member

    const { data: attendance, error } = await supabase
        .from('Attendance')
        .select(`
            *
        `)
        .match(matchValues)
        // .eq('event', event).eq('member', member)
    
    if (error) {
        console.error("fetch all attendance error:", error);
        return new Error(error)
    }
    console.log("fetched all attendance:", attendance)

    let attendanceObj = {}
    attendance.forEach(att => {
        attendanceObj[att.member] = att
    })

    return attendanceObj;
}

export async function GET(request, { params }) {
    const event = params.id;
    const member = params.member;
    const req = await request.json()
    const res = await getAttendance({...req, event, member})
    return NextResponse.json({ res })
}

// #####


export const updateAttendance = async ({ status, event, member }) => {
    const supabase = createServerComponentClient({ cookies });

    console.log({status}, {event}, {member})

    const { error } = await supabase
        .from('Attendance')
        .upsert({
            event,
            member,
            status: parseInt(status)
        })
    
    if (error) {
        console.error("update attendance error:", error);
        return new Error(error)
    }
    
    return true;
}

export async function PUT(request, { params }) {
    const event = params.id;
    const member = params.member;
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateAttendance({...req, event, member})
    return NextResponse.json({ res })
}