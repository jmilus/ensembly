import updateEnsemble from '../../../lib/ensembles/_updateThisEnsemble';

const updateThisEnsemble = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateEnsemble(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateThisEnsemble;