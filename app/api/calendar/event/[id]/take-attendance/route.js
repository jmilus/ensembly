import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getAttendanceStatus = async () => {
    const supabase = createServerComponentClient({ cookies });

    const { data: attendanceStatus, error } = await supabase
        .from('AttendanceStatus')
        .select(`
            *
        `)
    
    if (error) {
        console.error("fetch all attendance status error:", error);
        return new Error(error)
    }

    return attendanceStatus;
}

export const upsertAttendance = async (data) => {
    const { event, member, status } = data;
    const supabase = createServerComponentClient({ cookies });

    const { data: attendance, error } = await supabase
        .from('Attendance')
        .upsert([
            {
                event,
                member,
                status
            }
        ])
        .select()
    
    if (error) {
        console.error("create attendance error:", error)
        return new Error(error);
    }
    
    console.log("created attendance:", {attendance})
    return attendance[0];
}

export async function GET(request, { params }) {
    const event = params.id;
    const req = await request.json()
    const res = await getAttendanceStatus({...req, event})
    return NextResponse.json({ res })
}

export async function POST(request, { params }) {
    const { id } = params;
    const req = await request.json()
    const res = await createAttendance({...req, ensemble: id})
    return NextResponse.json({ res })
}