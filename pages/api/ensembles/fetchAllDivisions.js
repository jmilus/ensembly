import getAllDivisions from '../../../lib/ensembles/_fetchAllDivisions';

const fetchAllDivisions = async (req, res) => {
    
    let response = [];
    try {
        response = await getAllDivisions(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default fetchAllDivisions;