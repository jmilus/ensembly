import prisma from '../../../lib/prisma';

const deleteOneSchemaAssignment = async ({id}) => {

    const updatedEnsemble = await prisma.schemaAssignment.delete({
        where: { id: parseInt(id) },
    })
    return updatedEnsemble;
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