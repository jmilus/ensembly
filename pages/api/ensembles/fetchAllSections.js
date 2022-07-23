import getAllSections from '../../../lib/ensembles/_fetchAllSections';

const fetchAllSections = async (req, res) => {
    
    let response = [];
    try {
        response = await getAllSections(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default fetchAllSections;