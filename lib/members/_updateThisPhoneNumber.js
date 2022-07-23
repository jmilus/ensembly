import { PhoneRank, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const _updateThisPhoneNumber = async (data) => {
    const { id, prefix, phonenumber, rank, linkedId } = data;

    const phoneId = id ? id : "new";

    const payload = {
        prefix: prefix,
        phonenumber: phonenumber,
        rank: rank,
        memberId: linkedId
    }

    const memberPhoneNumber = await prisma.phoneNumber.upsert({
        where: { id: phoneId },
        update: payload,
        create: payload
    })
    return memberPhoneNumber;
}

export default _updateThisPhoneNumber;