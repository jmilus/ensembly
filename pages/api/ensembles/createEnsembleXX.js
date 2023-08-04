import prisma from '../../../lib/prisma';

export const createNewEnsemble = async (data) => {
    const { name, typeId } = data;
    
    const newEnsemble = await prisma.ensemble.create({
        data: {
            name: name,
            type: {
                connect: {
                    id: parseInt(typeId)
                }
            },
            schema: {
                create: {
                    name: `Base Schema`
                }
            }
        }
    })
    return newEnsemble;
}

const createEnsemble = async (req, res) => {

    let response = [];
    try {
        response = await createNewEnsemble(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'failed to create ensemble', err });
    }
}

export default createEnsemble;