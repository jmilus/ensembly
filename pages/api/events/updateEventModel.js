import prisma from '../../../lib/prisma';

export const updateOneEventModel = async (data) => {
    console.log({ data });
    const { id, name, modStartDate, modEndDate, details, eventType } = data;

    const result = prisma.eventModel.update({
        where: { id: id },
        data: {
            name: name,
            modStartDate: new Date(modStartDate),
            modEndDate: new Date(modEndDate),
            details: details,
            eventType: eventType ? { connect: { id: parseInt(eventType) } } : undefined
        },
        include: {
            eventType: true,
            location: true,
            parentModel: true,
            childModels: true,
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