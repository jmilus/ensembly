import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchManyEventModels = async (props) => {
    console.log({props})

    const fetchedEventModels = await prisma.eventModel.findMany({
        where: {
            endDate: { gte: props?.startDate || undefined },
            startDate: { lte: props?.endDate || undefined }
        },
        include: {
            eventType: true,
            location: true,
            ensembles: true,
            instances: true
        }
    })
    
    const processedEventModels = fetchedEventModels.map(model => {
        return formatDBObject(model);
    })
    
    return processedEventModels;
}

const getManyEventModels = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyEventModels(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyEventModels;