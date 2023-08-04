import prisma from '../../../lib/prisma';

export const createNewSchema = async (data) => {
    console.log(data);
    const { name, ensembleId } = data;
    
    const newSchema = await prisma.schema.create({
        data: {
            name: name,
            ensemble: {
                connect: {
                    id: ensembleId
                }
            }
        }
    })
    return newSchema;
}

const createSchema = async (req, res) => {

    let response = [];
    try {
        response = await createNewSchema(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'failed to create schema', err });
    }
}

export default createSchema;