import createMember from '../../../lib/members/_createNewMember';

const createNewMember = async (req, res) => {

    let response = [];
    try {
        response = await createMember(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'failed to create member', err });
    }
}

export default createNewMember;