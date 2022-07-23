import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const deletePhoneNumber = async (data) => {
    const { id } = data;
    console.log("phone number id:", id);
    const deletedPhoneNumber = await prisma.phonenumber.delete({
        where: {
            id: id
        },
        select: { id: true, phonenumber: true }
    })

    return deletedPhoneNumber;
}

export default deletePhoneNumber;