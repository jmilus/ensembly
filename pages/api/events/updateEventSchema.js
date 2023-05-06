import prisma from '../../../lib/prisma';

export const updateEventSchemas = async (data) => {
    const { id, schemas=[] } = data;

    const schemasList = Array.isArray(schemas) ? schemas : [schemas];

    const schemasToAdd = schemasList.map(schema => {
        return { eventId: id, schemaId: schema }
    })

    const deletedSchemas = prisma.eventSchemas.deleteMany({
        where: {
            eventId: id,
            schemaId: { notIn: schemasList }
        }
    })

    const addedSchemas = prisma.eventSchemas.createMany({
        data: schemasToAdd,
        skipDuplicates: true
    })

    return prisma.$transaction([deletedSchemas, addedSchemas]);
}

const updateSomeEventSchemas = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateEventSchemas(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateSomeEventSchemas;