import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { formatDBObject } from '../../../utils';

export const fetchOneMember = async (id) => {
    const supabase = createServerComponentClient({ cookies });
    const { data: fetchedMember, error } = await supabase
        .from('Member')
        .select(`
            *,
            EmailAddress ( * ),
            PhoneNumber ( * ),
            Address ( * ),
            EnsembleMembership ( * )
        `)
        .eq('id', id)
    
    if (error) {
        console.error("Fetch One Member error:", error);
        return new Error(error);
    }

    return formatDBObject(fetchedMember[0]);
}

const getOneMember = async (req, res) => {
    const { id } = req.query;
    let response = [];
    try {
        if (id) {
            response = await fetchOneMember(id);
            res.status(200);
            res.json(response);
        } else {
            res.status(500);
            res.json({ message: "that id does not exist" });
        }
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneMember;