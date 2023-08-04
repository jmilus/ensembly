import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { formatDBObject } from '../../../utils';

export const fetchManyMembers = async () => {
    const supabase = createServerComponentClient({ cookies });
    const { data: fetchedMembers, error } = await supabase
        .from('Member')
        .select(`
            *
        `)
    
    console.log({ fetchedMembers }, { error })
    
    const processedMembers = fetchedMembers.map(member => {
        return formatDBObject(member);
    })
    
    return processedMembers;
}

const getManyMembers = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyMembers(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyMembers;