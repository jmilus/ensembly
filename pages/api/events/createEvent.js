import prisma from '../../../lib/prisma';

export const createNewEvent = async (data) => {
    const { name, startDate, endDate, details, typeId, ensembles } = data; 

    console.log({ data });

    const eventEnsembles = Array.isArray(ensembles) ? ensembles : [{ensembleId: ensembles}]

    const newEvent = await prisma.event.create({
        data: {
            anchorDate: new Date(startDate).toLocaleDateString(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            model: {
                create: {
                    name,
                    details,
                    modStartDate: new Date(startDate),
                    modEndDate: new Date(endDate),
                    eventType: {
                        connect: { id: typeId }
                    },
                    recEndCount: 1,
                    ensembles: {
                        createMany: {
                            data: eventEnsembles
                        }
                    },
                }
            }
        },
        include: {
            model: true
        }
    })

    console.log("prisma event return:", newEvent);
    
    return newEvent;
}

const createEvent = async (req, res) => {
    
    let response = [];
    try {
        response = await createNewEvent(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error("there is some kind of problem:", err);
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default createEvent;