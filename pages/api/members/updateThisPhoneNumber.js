import _updateThisPhoneNumber from '../../../lib/members/_updateThisPhoneNumber';

const updateThisPhoneNumber = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await _updateThisPhoneNumber(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateThisPhoneNumber;