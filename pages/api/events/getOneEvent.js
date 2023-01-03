import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchOneEvent = async (id) => {
    const fetchedEvent = await prisma.event.findUnique({
        where: {
            id: id
        },
		include: {
            model: {
                include: {
                    eventType: true,
                    location: true,
                    ensembles: true
                }
            },
            schemas: true,
            location: true,
            attendance: true
		}
    })

	return formatDBObject(fetchedEvent);
}

const getOneEvent = async (req, res) => {
    let response = [];
    try {
        response = await fetchOneEvent(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneEvent;