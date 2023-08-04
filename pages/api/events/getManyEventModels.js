import { supabase } from '../../../lib/supabase-server';
import { formatDBObject } from '../../../utils';

export const fetchManyEventModels = async (props) => {
    console.log({props})

    const { data: fetchedEventModels, error } = await supabase
        .from('EventModel')
        .select(`
            *,
            EventType (*)
        `)
        .gte('modelStartDate', props?.startDate || undefined)
        .lte('modelEndDate', props?.endDate || undefined)
    
    const processedEventModels = fetchedEventModels.map(model => {
        return formatDBObject(model);
    })
    
    return processedEventModels;
}

const getManyEventModels = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEventModels(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEventModels;