import deleteEmail from '../../../lib/members/_deleteThisEmail';

const deleteThisEmail = async (req, res) => {
    console.log("id received:", req.body.id);
    let response = [];
    try {
        response = await deleteEmail(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default deleteThisEmail;