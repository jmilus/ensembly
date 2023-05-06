import prisma from '../../../lib/prisma';

import CALENDAR from '../../../utils/calendarUtils';

export const updateOneEvent = async (data) => {
    console.log({ data });
    const { id, startDate, endDate, exception, note } = data;

    let hasException = exception;
    if (exception === undefined) {
        hasException = startDate != undefined || endDate != undefined;
    } 

    const oneEvent = prisma.event.update({
        where: { id: id },
        data: {
            anchorDate: undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            exception: hasException,
            note: note
        },
        include: {
            model: {
                include: {
                    eventType: true,
                    location: true,
                    parentModel: true
                }
            },
            schemas: true,
            location: true,
            attendance: true
        }
    })

    return oneEvent
    
}

const updateEvent = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneEvent(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateEvent;