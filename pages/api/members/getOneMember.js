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
    
    console.log("API", {fetchedMember});

    // const tempEnsembles = {};
    // fetchedMember.memberships.forEach((m, i) => {
    //     console.log(m)
    //     const newObj = {
    //         id: m.ensembleId,
    //         name: m.ensemble.name,
    //         type: m.ensemble.type,
    //         capacities: []
    //     }
    //     const capacity = {
    //         membershipId: m.id,
    //         startDate: m.startDate,
    //         endDate: m.endDate,
    //         status: m.status,
    //         name: m.capacity,
    //         title: m.title,
    //         division: m.division,
    //         subDivision: m.subDivision
    //     }

    //     if (!tempEnsembles[m.ensembleId]) {
    //         tempEnsembles[m.ensembleId] = newObj;
    //     } 
    //     tempEnsembles[m.ensembleId].capacities.push(capacity)
    // })
    // fetchedMember.ensembles = tempEnsembles;


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