import { supabase } from '../../../lib/supabase-server';
import { formatDBObject } from '../../../utils';

export const fetchOneEventModel = async (id) => {
    const { data: fetchedInstance, error } = await supabase
        .from('EventModel')
        .select(`
            *,
            EventType (*),
            Address (*),
            parent (*),
            EventModel (*),
            Event (*, EventLineup (Lineup (*)))
        `)
        .eq('id', id)
    
    if (error) console.log("Fetch One Event Model error:", error);

    console.log({fetchedInstance})

	return formatDBObject(fetchedInstance);
}

const getOneEventModel = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchOneEventModel(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneEventModel;