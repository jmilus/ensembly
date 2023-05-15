import prisma from '../../../lib/prisma';

export const fetchModelSchemas = async (modelId="none") => {
    console.log("fetching mmodel events for model:", modelId)
    const fetchedSchemas = await prisma.schema.findMany({
        where: {
            events: {
                some: {
                    event: {
                        is: { eventModelId: modelId }
                    }
                }
            }
        }
    })
    
    return fetchedSchemas;
}

const getModelSchemas = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchModelSchemas(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getModelSchemas;