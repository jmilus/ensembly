import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const _updateMembership = async (data) => {
    console.log("data:", data)
    const { id, ensembleId, startDate, endDate, status="Active", section, role, linkedId } = data;

    const membershipId = id ? id : "new";

    const membership = await prisma.ensembleMembership.upsert({
        where: { id: membershipId },
        update: {
            memberId: linkedId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status,
            role,
            sectionId: section ? parseInt(section) : undefined
        },
        create: {
            memberId: linkedId,
            ensembleId: ensembleId ? parseInt(ensembleId) : 0,
            role
        }
    })
    return membership;
}

export default _updateMembership;