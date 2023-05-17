import prisma from '../../../lib/prisma';

import { formatDBObject } from '../../../utils';

export const fetchOneMember = async (id) => {
    const fetchedMember = await prisma.member.findUnique({
        where: {
            id: id
        },
        include: {
            memberBio: true,
            photos: true,
            memberships: {
                include: {
                    ensemble: {
                        include: {
                            type: true
                        }
                    }
                }
            },
            phoneNumbers: true,
            addresses: true,
            emails: {
                orderBy: {
                    rank: 'asc'
                }
            }
        }
    })

    return formatDBObject(fetchedMember);
}

const getOneMember = async (req, res) => {
    const { id } = req.query;
    let response = [];
    try {
        if (id) {
            response = await fetchOneMember(id);
            res.status(200);
            res.json(response);
        } else {
            res.status(500);
            res.json({ message: "that id does not exist" });
        }
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getOneMember;