import prisma from '../../../lib/prisma';

export const updateModelSchemas = async (data) => {
    const { eventModel, schemas = [] } = data;

    const schemasList = Array.isArray(schemas) ? schemas : [schemas];

    const schemasToAdd = []
    
    const modelEvents = await prisma.event.findMany({
        where: {eventModelId: eventModel}
    })

    modelEvents.forEach(event => {
        schemasList.map(schema => {
            schemasToAdd.push( { eventId: event.id, schemaId: schema } )
        })

    })
    
    const deletedSchemas = prisma.eventSchemas.deleteMany({
        where: {
            eventId: { in: modelEvents.map(me => me.id) },
            schemaId: { notIn: schemasList }
        }
    })

    const addedSchemas = prisma.eventSchemas.createMany({
        data: schemasToAdd,
        skipDuplicates: true
    })

    return prisma.$transaction([deletedSchemas, addedSchemas]);
}

const updateOneModelSchemas = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateModelSchemas(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateOneModelSchemas;