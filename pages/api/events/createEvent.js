import 'server-only';

import { supabase } from '../../../lib/supabase-server';
import { createEventModel } from './createModel';

export const createNewEvent = async (data) => {
    const { eventName, modelName, startDate, endDate, details, typeId, modelId="new", parentModelId } = data; 

    console.log({ data });

    // const eventEnsembles = Array.isArray(ensembles) ? ensembles : [{ ensembleId: ensembles }]

    // const newEvent = await prisma.event.create({
    //     data: {
    //         anchorDate: new Date(startDate).toLocaleDateString(),
    //         startDate: new Date(startDate),
    //         endDate: new Date(endDate),
    //         name: eventName || modelName,
    //         model: {
    //             connectOrCreate: {
    //                 where: { id: modelId },
    //                 create: {
    //                     name: modelName,
    //                     details,
    //                     modStartDate: new Date(startDate),
    //                     modEndDate: new Date(endDate),
    //                     eventType: {
    //                         connect: { id: parseInt(typeId) }
    //                     },
    //                     recEndCount: 1,
    //                     parentModel: parentModelId ? {
    //                         connect: { id: parentModelId }
    //                     } : undefined
    //                 }
    //             }
    //         }

    //     },
    //     include: {
    //         model: true
    //     }
    // })
    let modelIdValue = modelId
    if (modelId === "new") {
        const { id } = await createEventModel(data);
        if (!id) return new Error("error creating event model");
        modelIdValue = id;
    }
    
    const { data: newEvent, error } = await supabase.from('Event').insert({
        anchorDate: new Date(startDate).toLocaleDateString(),
        eventStartDate: new Date(startDate),
        eventEndDate: new Date(endDate),
        name: eventName || modelName,
        model: modelIdValue
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