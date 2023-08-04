import 'server-only';

import { supabase } from '../../../lib/supabase-server';

export const createEventModel = async (data) => {
    const { modelName, startDate, endDate, details, typeId, parentModelId } = data;

    const { data: model, error } = await supabase.from('EventModel').insert({
        name: modelName,
        modelStartDate: new Date(startDate),
        modelEndDate: new Date(endDate),
        details: details,
        type: typeId,
        parent: parentModelId
    })

    if (error) console.log("Create New Model error:", error);
    console.log({model})

    return model;
}

const createModel = async (req, res) => {
    
    let response = [];
    try {
        response = await createEventModel(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error("there is some kind of problem:", err);
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default createModel;