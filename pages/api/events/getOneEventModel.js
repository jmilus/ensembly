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
            parentModel: {
                include: {
                    eventType: true
                }
            },
            childModels: {
                include: {
                    eventType: true
                }
            },
            events: {
                orderBy: {startDate: 'asc'}
            }
		}
    })

    console.log({fetchedInstance})

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