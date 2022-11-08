import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const _updateMembership = async (data) => {
    console.log("data:", data)
    const { id, ensembleId, startDate, endDate, status="Active", capacity, division, subdivision, linkedId } = data;
    console.log({division}, {subdivision})
    const membershipId = id ? id : "new";

    const membership = await prisma.ensembleMembership.upsert({
        where: { id: membershipId },
        update: {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status,
            capacity,
            divisionId: division,
            subDivisionId: subdivision
        },
        create: {
            memberId: linkedId,
            ensembleId: ensembleId ? parseInt(ensembleId) : 0, // only including this logic here because Updates do not require/supply the ensembleId
            status,
            capacity,
            divisionId: division,
            subDivisionId: subdivision
        }
    })
    
    return membership;
}

export default _updateMembership;