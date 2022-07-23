import getAllMembers from '../../../lib/members/_fetchAllMembers';

const fetchAllMembers = async (req, res) => {
    
    let response = [];
    try {
        response = await getAllMembers();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default fetchAllMembers;