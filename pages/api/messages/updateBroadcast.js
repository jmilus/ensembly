import prisma from '../../../lib/prisma';

export const updateOneBroadcast = async (data) => {
    const { id="new", subject, body, status } = data;

    const jsonBody = JSON.stringify(body)
    const updatedEnsemble = await prisma.broadcast.upsert({
        where: { id: id },
        update: {
            subject: subject,
            body: jsonBody,
            status: status || 'DRAFT',
        },
        create: {
            subject: subject,
            body: jsonBody,
            status: status || 'DRAFT',
        }
    })
    return updatedEnsemble;
}

const updateBroadcast = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneBroadcast(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateBroadcast;