import prisma from '../../../lib/prisma';

export const fetchManySchemas = async (ensembleId) => {
    const fetchedSchemas = await prisma.schema.findMany({
        where: {
            ensembleId: ensembleId ? ensembleId : undefined
        },
        orderBy: {
            id: "asc"
        }
    })
    
    return fetchedSchemas;
}

const getManySchemas = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManySchemas(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManySchemas;