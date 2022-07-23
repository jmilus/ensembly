import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const deleteEmail = async (data) => {
    const { id } = data;
    console.log("email id:", id);
    const deletedEmail = await prisma.email.delete({
        where: {
            id: id
        },
        select: { id: true, address: true }
    })

    return deletedEmail;
}

export default deleteEmail;