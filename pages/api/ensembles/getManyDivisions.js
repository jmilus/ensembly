import prisma from '../../../lib/prisma';

export const fetchManyDivisions = async (typeId) => {
    const fetchedSections = await prisma.division.findMany({
        where: {
            ensembleTypeId: typeId ? parseInt(typeId) : undefined
        },
        include: {
            childDivisions: true
        }
    })
    
    return fetchedSections;
}

const getManyDivisions = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyDivisions(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyDivisions;