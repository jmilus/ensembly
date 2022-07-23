import _updateThisEmail from '../../../lib/members/_updateThisEmail';

const updateThisEmail = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await _updateThisEmail(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateThisEmail;