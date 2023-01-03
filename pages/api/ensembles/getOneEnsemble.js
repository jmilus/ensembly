import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchOneEnsemble = async (id) => {
    const fetchedEnsemble = await prisma.ensemble.findUnique({
        where: {
            id: id
        },
        include: {
			membership: {
				include: {
					member: true,
				}
			},
            type: true,
            event: true,
            schema: true
        }
    })

	return formatDBObject(fetchedEnsemble);
}

const getOneEnsemble = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchOneEnsemble(req.query.id);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneEnsemble;