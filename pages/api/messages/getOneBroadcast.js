import { supabase } from '../../../lib/supabase-server';

export const fetchOneBroadcast = async (id) => {
    const { data: fetchedBroadcast, error } = await supabase
        .from('Broadcast')
        .select('*')
        .eq('id', id)

    // console.log({ fetchedBroadcast }, { error })
    return fetchedBroadcast;
}

const getOneBroadcast = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchOneBroadcast(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneBroadcast;