import prisma from '../../../lib/prisma';
import { CAL, compareDates } from '../../../utils/calendarUtils';


const generateRecurrenceModel = (recurrenceData) => {
    const { modStartDate, interval, period, occurrence, recEndDate } = recurrenceData;
    if (!modStartDate || !interval || !period || !occurrence || !recEndDate) return [];

    const recurrenceSet = []

    let cursorDate = new Date(modStartDate);
    const occArr = Array.isArray(occurrence) ? occurrence : [occurrence];
    do {
        occArr.every(occ => {
            let newCursorDate;
            switch (period) {
                case "Week":
                    const weekdayIndex = CAL.weekday.short.indexOf(occ)
                    if (weekdayIndex >= cursorDate.getDay()) newCursorDate = cursorDate.getDate() + (weekdayIndex - cursorDate.getDay());
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

export const updateRecurrence = async (data) => {
    console.log({ data });
    const { id, interval, period, occurrence, recEndCount, recEndDate, modStartDate, modEndDate } = data;

    const modelEvents = await prisma.event.findMany({
        where: { eventModelId: id }
    })

    if (!modelEvents) return false;

    const newModel = {
        modStartDate: new Date(modStartDate),
        modEndDate: new Date(modEndDate),
        interval: interval,
        period: period,
        occurrence: occurrence,
        recEndDate: recEndDate
    }

    const eventDuration = new Date(modEndDate).valueOf() - new Date(modStartDate).valueOf();

    console.log({ modelEvents }, { newModel });
    // modelEvents.events.forEach(event => console.log("event", event))

    const recurrenceSet = generateRecurrenceModel(newModel);
    console.log({recurrenceSet})

    const newEvents = [];
    recurrenceSet.every(rec => {
        if (compareDates(rec, new Date()) > 0) return true;
        let newEvent = modelEvents.find(event => {
            console.log("comparing dates:", rec.toLocaleDateString(), event.anchorDate);
            return rec.toLocaleDateString() === event.anchorDate
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

    const removeEvents = modelEvents.filter(event => {
        if (compareDates(new Date(event.anchorDate), new Date()) > 0) return false;
        const keepEvent = recurrenceSet.find(rec => {
            return event.anchorDate === rec.toLocaleDateString()
        })
        if (keepEvent) return false;
        return true;
    })

    console.log({ removeEvents });

    const prismaTransaction = []

    removeEvents.map(removeEvent => {
        prismaTransaction.push(
            prisma.event.delete({
                where: { id: removeEvent.id }
            })
        )
    })

    newEvents.forEach(newEvent => {
        //
        prismaTransaction.push(
            prisma.event.upsert({
                where: { id: newEvent.id || "new" },
                create: newEvent,
                update: {
                    model: undefined,
                    anchorDate: new Date(newEvent.startDate).toLocaleDateString(),
                    startDate: newEvent.exception ? undefined : new Date(newEvent.startDate),
                    endDate: newEvent.exception ? undefined : new Date(newEvent.endDate),
                    exception: undefined
                }
            })
        )
    });

    prismaTransaction.push(
        prisma.eventModel.update({
            where: { id: id },
            data: {
                interval: parseInt(interval),
                period: period,
                occurrence: occurrence,
                recEndDate: new Date(recEndDate),
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

const updateEventModelRecurrence = async (req, res) => {
    console.log("updateEventModelRecurrence request data:", req.body);
    let response = []
    try {
        response = await updateRecurrence(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateEventModelRecurrence;