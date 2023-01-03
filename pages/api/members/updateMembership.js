import prisma from '../../../lib/prisma';

export const updateOneMembership = async (data) => {
    const { id, memberId, ensembleId, startDate, statusDate, status } = data;

    const membership = await prisma.ensembleMembership.upsert({
        where: { id: id || "new" },
        update: {
            startDate: undefined,
            statusDate: statusDate ? new Date(statusDate) : new Date(),
            status: status
        },
        create: {
            member: {
                connect: { id: memberId }
            },
            ensemble: {
                connect: { id: ensembleId }
            },
            startDate: startDate ? new Date(startDate) : new Date(),
            statusDate: startDate ? new Date(startDate) : new Date(),
            status: status || "Active"
        },
        include: {
            ensemble: {
                include: {
                    type: true
                }
            }
        }
    })
    
    return membership;
}

const updateMembership = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneMembership(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateMembership;