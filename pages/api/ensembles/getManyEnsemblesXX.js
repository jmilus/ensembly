import 'server-only';

import { supabase } from '../../../lib/supabase-server';
import { formatDBObject } from '../../../utils';

export const fetchManyEnsembles = async () => {
    const { data: fetchedEnsembles, error } = await supabase
        .from('Ensemble')
        .select('*')
    
    if (error) console.log({ error })

    const processedEnsembles = fetchedEnsembles.map(ensemble => {
        return formatDBObject(ensemble);
    })
    
    return processedEnsembles;
}

const getManyEnsembles = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEnsembles();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEnsembles;