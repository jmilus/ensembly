import prisma from '../../../lib/prisma';

const deleteOneSchemaAssignment = async ({membershipId, schemaId, divisionId}) => {

    const deletedAssignment = await prisma.schemaAssignment.delete({
        where: { 
            membershipId_schemaId_divisionId: {
                membershipId: membershipId,
                schemaId: schemaId,
                divisionId: divisionId
            }
         }
    })
    return deletedAssignment;
}

const deleteSchemaAssignment = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await deleteOneSchemaAssignment(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default deleteSchemaAssignment;