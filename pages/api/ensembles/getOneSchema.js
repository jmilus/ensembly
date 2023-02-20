import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchOneSchema = async (id) => {
    const fetchedSchema = await prisma.schema.findUnique({
        where: {
            id: id
        },
        include: {
            assignments: {
                where: {
                    membership: {
                        is: {
                            status: "Active"
                        }
                    }
                },
                include: {
                    membership: {
                        include: { member: true }
                    },
                    division: true
                }
            }
        }
    })

    return formatDBObject(fetchedSchema);
}

const getOneSchema = async (req, res) => {
    console.log("request to fetch schema with id", req.query.id)
    let response = [];
    try {
        response = await fetchOneSchema(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneSchema;