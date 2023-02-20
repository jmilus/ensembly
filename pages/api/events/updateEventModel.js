import prisma from '../../../lib/prisma';

export const updateOneEventModel = async (data) => {
    console.log({ data });
    const { id, name, modStartDate, modStartDate_time, modEndDate, modEndDate_time, details, eventType } = data;

    const startDateAndTime = new Date(`${modStartDate}:${modStartDate_time}`);
    const endDateAndTime = new Date(`${modEndDate}:${modEndDate_time}`);

    const result = prisma.eventModel.update({
        where: { id: id },
        data: {
            name: name,
            modStartDate: new Date(startDateAndTime),
            modEndDate: new Date(endDateAndTime),
            details: details,
            eventType: eventType ? { connect: { id: parseInt(eventType) } } : undefined
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
    
    return result;
    
}

const updateEventModel = async (req, res) => {
    console.log("update request data:", req.body);
    let response = []
    try {
        response = await updateOneEventModel(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateEventModel;