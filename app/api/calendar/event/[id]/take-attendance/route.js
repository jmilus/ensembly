import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';

export const getAttendanceStatus = async () => {
    const supabase = createClient();

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

// export const upsertAttendance = async (data) => {
//     const { event, member, status } = data;
//     const supabase = createClient();

//     const { data: attendance, error } = await supabase
//         .from('Attendance')
//         .upsert([
//             {
//                 event,
//                 member,
//                 status
//             }
//         ])
//         .select()
    
//     if (error) {
//         console.error("create attendance error:", error)
//         return new Error(error);
//     }
    
//     console.log("created attendance:", {attendance})
//     return attendance[0];
// }

export async function GET() {
    const res = await getAttendanceStatus()
    return NextResponse.json({ res })
}

// export async function POST(request, { params }) {
//     const _req = await request.formData()
//     const req = extractFields(_req);
//     const res = await createAttendance({...req, ensemble: params.id})
//     return NextResponse.json({ res })
// }