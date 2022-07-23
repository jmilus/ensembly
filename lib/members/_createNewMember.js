import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const createMember = async (data) => {
    const { firstName, lastName } = data;

    const newMember = await prisma.member.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            name: `${firstName} ${lastName}`,
            memberBio: {
                create: {}
            }
        }
    })
    return newMember;
}

export default createMember;