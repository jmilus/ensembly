import 'server-only';

import { supabase } from '../../../lib/supabase-server';
import { formatDBObject } from '../../../utils';

export const fetchManyEvents = async ({ startDate, endDate, bufferDays, message }) => {

    console.log({ startDate })

    const bufferStartDate = new Date(startDate);
    const bufferEndDate = new Date(endDate);
    
    if (bufferDays) {
        bufferStartDate.setDate(bufferStartDate.getDate() - bufferDays)
        bufferEndDate.setDate(bufferEndDate.getDate() + bufferDays)
    }

    console.log({bufferStartDate})

    const { data: fetchedEvents, error } = await supabase
        .from('Event')
        .select(`*,
            EventModel (*, 
                type (*)),
            location (*),
            Attendance (*)
        `)
        .gte('eventEndDate', bufferStartDate.toISOString() || undefined)
        .lte('eventStartDate', bufferEndDate.toISOString() || undefined)
    
    if (error) console.log("Fetch Many Events error:", {error})
    
    const processedEvents = fetchedEvents.map(event => {
        return formatDBObject(event);
    })
    
    return processedEvents;
}

const getManyEvents = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEvents(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEvents;