import { supabase } from '../../../lib/supabase-server';

export const fetchManyBroadcasts = async () => {
    const { data: fetchedBroadcasts, error } = await supabase
        .from('Broadcast')
        .select('*')
    
    console.log({ fetchedBroadcasts })
    return fetchedBroadcasts;
}

const getManyBroadcasts = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyBroadcasts();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyBroadcasts;