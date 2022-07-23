import getThisMember from '../../../lib/members/_fetchThisMember';

const fetchThisMember = async (req, res) => {
    
    let response = [];
    try {
        response = await getThisMember(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default fetchThisMember;