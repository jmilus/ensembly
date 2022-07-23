import { EmailRank, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const _updateThisEmail = async (data) => {
    const { id, address, rank, linkedId } = data;

    const emailId = id ? id : "new";

    const payload = {
        address: address,
        rank: rank,
        memberId: linkedId
    }

    const memberEmail = await prisma.email.upsert({
        where: { id: emailId },
        update: payload,
        create: payload
    })
    return memberEmail;
}

export default _updateThisEmail;