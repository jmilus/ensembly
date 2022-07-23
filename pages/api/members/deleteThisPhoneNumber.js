import deletePhoneNumber from '../../../lib/members/_deleteThisPhoneNumber';

const deleteThisPhoneNumber = async (req, res) => {
    console.log("id received:", req.body.id);
    let response = [];
    try {
        response = await deletePhoneNumber(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default deleteThisPhoneNumber;