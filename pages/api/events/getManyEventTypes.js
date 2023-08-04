import 'server-only';

import { supabase } from '../../../lib/supabase-server';

export const fetchManyEventTypes = async () => {
    // const fetchedEventTypes = await prisma.eventType.findMany()
    const { data: fetchedEventTypes, error } = await supabase
        .from('EventType')
        .select('*')
    
    if(error) console.log("Fetch Many Event Types error:", { error })
    
    return fetchedEventTypes;
}

const getManyEventTypes = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEventTypes();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEventTypes;