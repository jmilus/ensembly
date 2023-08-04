import prisma from '../../../lib/prisma';

const updateOneSchemaAssignment = async (data) => {
    const { id, schemaId, membershipId, memberId, capacity, oldDivisionId, divisionId, title } = data;

    const updatedAssignment = await prisma.schemaAssignment.upsert({
        where: { 
            membershipId_schemaId_divisionId: {
                membershipId: membershipId,
                schemaId: schemaId,
                divisionId: oldDivisionId || divisionId
            }
         },
        create: {
            membership: { connect: { id: membershipId } },
            memberId: memberId,
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
    return updatedAssignment;
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