import prisma from '../../../lib/prisma';
import { CAL, compareDates } from '../../../utils/calendarUtils';


const deleteRecurrence = async ({ id }) => {
    const setToDelete = await prisma.event.findMany({
        where: {eventModelId : id}
    })
    console.log({setToDelete})
    return setToDelete;
}

const deleteEventModelRecurrence = async (req, res) => {
    console.log("deleteEventModelRecurrence request data:", req.query);
    let response = []
    try {
        response = await deleteRecurrence(req.query);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default deleteEventModelRecurrence;