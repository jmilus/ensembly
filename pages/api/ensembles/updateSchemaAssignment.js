import prisma from '../../../lib/prisma';

const updateOneSchemaAssignment = async (data) => {
    const { id, schemaId, memberId, capacity, divisionId, title } = data;

    const updatedEnsemble = await prisma.schemaAssignment.upsert({
        where: { id: id ? parseInt(id) : 0 },
        create: {
            member: { connect: { id: memberId } },
            schema: { connect: { id: schemaId } },
            capacity: capacity,
            division: { connect: { id: divisionId } },
            title: title
        },
        update: {
            capacity: capacity,
            division: { connect: { id: parseInt(divisionId) } },
            title: title
        }
    })
    return updatedEnsemble;
}

const updateSchemaAssignment = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneSchemaAssignment(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateSchemaAssignment;