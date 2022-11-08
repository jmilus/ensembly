import getAllSubdivisions from '../../../lib/ensembles/_fetchAllSubdivisions';

const fetchAllSubdivisions = async (req, res) => {
    
    let response = [];
    try {
        response = await getAllSubdivisions(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default fetchAllSubdivisions;