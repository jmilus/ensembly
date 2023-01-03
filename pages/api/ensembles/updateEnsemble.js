import prisma from '../../../lib/prisma';

export const updateOneEnsemble = async (data) => {
    const { id, name, type } = data;

    const updatedEnsemble = await prisma.ensemble.update({
        where: { id: parseInt(id) },
        data: {
            name: name,
            type: type
        },
        include: {
            members: true
        }
    })
    return updatedEnsemble;
}

const updateOneEnsemble = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneEnsemble(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateOneEnsemble;