import updateMember from '../../../lib/members/_updateThisMember';

const updateThisMember = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateMember(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateThisMember;