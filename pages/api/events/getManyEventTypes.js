import prisma from '../../../lib/prisma';

export const fetchManyEventTypes = async () => {
    const fetchedEventTypes = await prisma.eventType.findMany()
    
    return fetchedEventTypes;
}

const getManyEventTypes = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEventTypes();
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEventTypes;