import { supabase } from '../../../lib/supabase-server';

export const fetchEventAttendance = async (eventId) => {
    const { data: attendanceArray, error } = await supabase
        .from('Attendance')
        .select(`*`)
        .eq('eventId', eventId)

    const attendanceObj = {}
    attendanceArray.forEach(att => {
        attendanceObj[att.memberId] = att.status;
    })

    return attendanceObj;
}

const getEventAttendance = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchEventAttendance(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getEventAttendance;