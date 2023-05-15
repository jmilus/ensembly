import prisma from '../../../lib/prisma';

export const updateManySchemas = async (data) => {
    console.log({ data })

    const schemasToAdd = [];
    const schemasToDelete = [];

    Object.keys(data).forEach(eventId => {
        const eventSchemaList = data[eventId]
        Object.keys(eventSchemaList).forEach(schemaId => {
            const eventSchema = {eventId: eventId, schemaId, schemaId}
            if (eventSchemaList[schemaId]) {
                schemasToAdd.push(eventSchema)
            } else {
                schemasToDelete.push(eventSchema);
            }
        })
    })

    const addedSchemas = prisma.eventSchemas.createMany({
        data: schemasToAdd,
        skipDuplicates: true
    })
    const deletedSchemas = prisma.eventSchemas.deleteMany({
        where: {
            eventId: { in: schemasToDelete.map(std => std.eventId) },
            schemaId: { in: schemasToDelete.map(std => std.schemaId) }
        }
    })

    console.log({ schemasToAdd }, { schemasToDelete });

    return prisma.$transaction([addedSchemas, deletedSchemas]);
}

const updateManySchemasInBulk = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateManySchemas(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateManySchemasInBulk;