import prisma from '../../../lib/prisma';

export const updateOneEnsemble = async (data) => {
    const { id, name, type, logoUrl } = data;

    const updatedEnsemble = await prisma.ensemble.update({
        where: { id: id },
        data: {
            name: name,
            type: type,
            logoUrl: logoUrl
        }
    })
    return updatedEnsemble;
}

const updateEnsemble = async (req, res) => {
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

export default updateEnsemble;