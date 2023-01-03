import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchOneEventModel = async (id) => {
    const fetchedInstance = await prisma.eventModel.findUnique({
        where: {
            id: id
        },
		include: {
			eventType: true,
            location: true,
            ensembles: true,
            events: {
                orderBy: {startDate: 'asc'}
            }
		}
    })

	return formatDBObject(fetchedInstance);
}

const getOneEventModel = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchOneEventModel(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneEventModel;