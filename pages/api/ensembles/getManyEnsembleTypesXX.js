import prisma from '../../../lib/prisma';

export const fetchManyEnsembleTypes = async () => {
    const fetchedEnsembleTypes = await prisma.ensembleType.findMany()
    //return fetchedEnsembleTypess;
    
    return fetchedEnsembleTypes;
}

const getManyEnsembleTypes = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEnsembleTypes();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEnsembleTypes;