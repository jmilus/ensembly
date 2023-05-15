import prisma from '../../../lib/prisma';

export const fetchManySchemaAssignments = async (schemas) => {

    const assignments = await prisma.schemaAssignment.findMany({
        where: {
            schemaId: {
                in: schemas
            }
        },
        include: {
            membership: {
                include: {
                    member: true
                }
            },
            division: true
        },
        distinct: ['memberId']
    })

    return assignments;
}

const getManyAssignments = async (req, res) => {
    console.log("request assignments", req.body)
    let response = [];
    try {
        response = await fetchManySchemaAssignments(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyAssignments;