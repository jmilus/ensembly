import { supabase } from '../../../lib/supabase-server';
import { formatDBObject } from '../../../utils';

export const fetchOneEvent = async (id) => {
    const { data: fetchedEvent, error } = await supabase
        .from('Event')
        .select(`*,
            EventModel (*, EventType (*), Address (*), parent (*)),
            Lineup (*),
            Address (*),
            Attendance (*)
        `)
        .eq('id', id)
    
    if(error) console.log("Fetch One Event error:", error)

	return formatDBObject(fetchedEvent);
}

const getOneEvent = async (req, res) => {
    let response = [];
    try {
        response = await fetchOneEvent(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneEvent;