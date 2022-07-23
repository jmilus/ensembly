import getAllEnsembles from '../../../lib/ensembles/_fetchAllEnsembles';

const fetchAllEnsembles = async (req, res) => {
    
    let response = [];
    try {
        response = await getAllEnsembles();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default fetchAllEnsembles;