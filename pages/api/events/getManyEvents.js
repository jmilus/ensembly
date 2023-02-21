import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchManyEvents = async ({ startDate, endDate, bufferDays, message }) => {
    // console.log({startDate}, {endDate}, {bufferDays}, {message})

    const bufferStartDate = new Date(startDate);
    const bufferEndDate = new Date(endDate);
    
    if (bufferDays) {
        bufferStartDate.setDate(bufferStartDate.getDate() - bufferDays)
        bufferEndDate.setDate(bufferEndDate.getDate() + bufferDays)
    }

    const fetchedEvents = await prisma.event.findMany({
        where: {
            endDate: { gte: new Date(bufferStartDate) || undefined },
            startDate: { lte: new Date(bufferEndDate) || undefined }
        },
        include: {
            model: {
                include: {
                    eventType: true,
                    ensembles: true
                }
            },
            location: true,
            attendance: true
        }
    })
    
    const processedEvents = fetchedEvents.map(event => {
        return formatDBObject(event);
    })
    
    return processedEvents;
}

const getManyEvents = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEvents(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEvents;