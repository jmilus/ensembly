import prisma from '../../../lib/prisma';
import { formatDBObject } from '../../../utils';

export const fetchManyMembers = async () => {
    const fetchedMembers = await prisma.member.findMany({
        include: {
            memberships: {
                where: {status: "Active"}
            },
            memberBio: true
        },
        orderBy: {
            lastName: 'asc'
        }
    })
    
    const processedMembers = fetchedMembers.map(member => {
        return formatDBObject(member);
    })
    
    return processedMembers;
}

const getManyMembers = async (req, res) => {
    
    let response = [];
    try {
        response = await fetchManyMembers(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getManyMembers;