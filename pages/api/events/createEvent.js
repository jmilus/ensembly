import prisma from '../../../lib/prisma';

export const createNewEvent = async (data) => {
    const { name, startDate, startDate_time, endDate, endDate_time, details, typeId, ensembles } = data; 

    console.log({ data });

    const eventEnsembles = Array.isArray(ensembles) ? ensembles : [{ ensembleId: ensembles }]
    
    const myStartDate = new Date(`${startDate}:${startDate_time}`);
    const myEndDate = new Date(`${endDate}:${endDate_time}`);

    const newEvent = await prisma.event.create({
        data: {
            anchorDate: new Date(myStartDate).toLocaleDateString(),
            startDate: new Date(myStartDate),
            endDate: new Date(myEndDate),
            model: {
                create: {
                    name,
                    details,
                    modStartDate: myStartDate,
                    modEndDate: myEndDate,
                    eventType: {
                        connect: { id: parseInt(typeId) }
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