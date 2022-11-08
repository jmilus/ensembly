import getThisMember from '../../../lib/members/_fetchThisMember';

const fetchThisMember = async (req, res) => {
    const { id } = req.query;
    let response = [];
    try {
        if (id) {
            response = await getThisMember(id);
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

export default fetchThisMember;