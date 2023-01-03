import prisma from '../../../lib/prisma';
import { compareDates } from '../../../utils/calendarUtils';

const generateRecurrenceModel = (recurrenceData) => {
    const { modStartDate, interval, period, occurrence, recEndDate } = recurrenceData;
    if (!modStartDate || !interval || !period || !occurrence || !recEndDate) return [];

    const recurrenceSet = []

    let cursorDate = new Date(modStartDate);
    console.log({ cursorDate });
    do {
        occurrence.every(occ => {
            let newCursorDate;
            switch (period) {
                case "Week":
                    if (occ >= cursorDate.getDay()) newCursorDate = cursorDate.getDate() + (occ - cursorDate.getDay());
                    break;
                case "Month":
                    newCursorDate = occ;
                    break;
                default:
                    return false;
            }
            if (!newCursorDate) return true;

            cursorDate.setDate(newCursorDate);
            if (compareDates(recEndDate, cursorDate) > 0) return false;

            recurrenceSet.push(new Date(cursorDate))
            return true;
        })
        //
        if (period === "Week") cursorDate.setDate(cursorDate.getDate() + ((7 * interval) - cursorDate.getDay()));
        if (period === "Month") cursorDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth() + (1 * interval), 1);
        
    } while (compareDates(cursorDate, recEndDate) > 0);

    return recurrenceSet;
}

export const updateOneEventModel = async (data) => {
    console.log({ data });
    const { id, name, modStartDate, modEndDate, details, eventType, interval, period, occurrence, recEndCount, recEndDate, context } = data;

    const oneModel = await prisma.eventModel.findUnique({
        where: { id: id },
        include: {
            events: true
        }
    })

    if (!oneModel) return false;

    const newModel = {
        modStartDate: modStartDate ? new Date(modStartDate) : oneModel.modStartDate,
        modEndDate: modEndDate ? new Date(modEndDate) : oneModel.modEndDate,
        interval: interval || oneModel.interval,
        period: period || oneModel.period,
        occurrence: occurrence || oneModel.occurrence,
        recEndDate: recEndDate || oneModel.recEndDate
    }

    const eventDuration = new Date(newModel.modEndDate).valueOf() - new Date(newModel.modStartDate).valueOf();

    console.log({ oneModel }, { newModel });
    // oneModel.events.forEach(event => console.log("event", event))

    const recurrenceSet = generateRecurrenceModel(newModel);
    console.log({recurrenceSet})

    const newEvents = [];
    recurrenceSet.every(rec => {
        if (compareDates(rec, new Date()) > 0) return true;
        let newEvent = oneModel.events.find(ee => {
            console.log("comparing dates:", rec.toLocaleDateString(), ee.anchorDate);
            return rec.toLocaleDateString() === ee.anchorDate
        })
        if (!newEvent) {
            newEvent = {
                model: { connect: { id: id } },
                anchorDate: rec.toLocaleDateString(),
                startDate: rec,
                endDate: new Date(rec.valueOf() + eventDuration)
            }
        }
        newEvents.push(newEvent);
        return true;
    })

    console.log({newEvents})

    const removeEvents = oneModel.events.filter(event => {
        if (compareDates(new Date(event.anchorDate), new Date()) > 0) return false;
        const keepEvent = recurrenceSet.find(rec => {
            return event.anchorDate === rec.toLocaleDateString()
        })
        if (keepEvent) return false;
        return true;
    })

    console.log({ removeEvents });

    const prismaTransaction = []

    removeEvents.map(event => {
        prismaTransaction.push(
            prisma.event.delete({
                where: { id: event.id }
            })
        )
    })

    newEvents.forEach(event => {
        let eventStartTime, eventEndTime;
        modStartDate ? eventStartTime = new Date(modStartDate).valueOf() - oneModel.modStartDate.valueOf() : undefined;
        modEndDate ? eventEndTime = new Date(modEndDate).valueOf() - oneModel.modEndDate.valueOf() : undefined;
        //
        prismaTransaction.push(
            prisma.event.upsert({
                where: { id: event.id || "new" },
                create: event,
                update: {
                    model: undefined,
                    anchorDate: modStartDate ? new Date(event.startDate).toLocaleDateString() : undefined,
                    startDate: event.exception ? undefined : modStartDate ? new Date(event.startDate.valueOf() + eventStartTime) : undefined,
                    endDate: event.exception ? undefined : modEndDate ? new Date(event.endDate.valueOf() + eventEndTime) : undefined,
                    exception: undefined
                }
            })
        )
    });

    prismaTransaction.push(
        prisma.eventModel.update({
            where: { id: id },
            data: {
                name: name,
                modStartDate: modStartDate ? new Date(modStartDate) : undefined,
                modEndDate: modEndDate ? new Date(modEndDate) : undefined,
                details: details,
                eventType: eventType ? { connect: { id: eventType } } : undefined,
                interval: interval ? parseInt(interval) : undefined,
                period: period,
                occurrence: occurrence,
                recEndDate: recEndDate ? new Date(recEndDate) : undefined,
                recEndCount: recurrenceSet.length
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
    )

    const result = prisma.$transaction(prismaTransaction);
    
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