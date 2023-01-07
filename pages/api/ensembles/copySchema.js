import prisma from '../../../lib/prisma';
import { fetchOneSchema } from './getOneSchema';

export const copyOneSchema = async (data) => {
    console.log(data);
    const { name, ensembleId, schemaId } = data;

    const schemaToCopy = await fetchOneSchema(schemaId)
    
    const newSchema = await prisma.schema.create({
        data: {
            name: name,
            ensemble: {
                connect: {
                    id: ensembleId
                }
            },
            assignments: {
                createMany: {
                    data: schemaToCopy.assignments
                }
            }
        }
    })
    return newSchema;
}

const copySchema = async (req, res) => {

    let response = [];
    try {
        response = await copyOneSchema(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'failed to create schema', err });
    }
}

export default copySchema;