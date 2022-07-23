import { AddressRank, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const _updateThisAddress = async (data) => {
    const { id, street, street2, city, state, postalCode, rank, linkedId } = data;

    const addressId = id ? id : "new";

    const payload = {
        street: street,
        street2: street2,
        city: city,
        state: state,
        postalCode: postalCode,
        rank: rank,
        memberId: linkedId
    }

    const memberEmail = await prisma.address.upsert({
        where: { id: addressId },
        update: payload,
        create: payload
    })
    return memberEmail;
}

export default _updateThisAddress;