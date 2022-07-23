import createEnsemble from '../../../lib/ensembles/_createNewEnsemble';

const createNewEnsemble = async (req, res) => {

    let response = [];
    try {
        response = await createEnsemble(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'failed to create ensemble', err });
    }
}

export default createNewEnsemble;