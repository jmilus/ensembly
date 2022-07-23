import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const updateEnsemble = async (data) => {
    const { id, name, type } = data;

    const updatedEnsemble = await prisma.ensemble.update({
        where: { id: id },
        data: {
            name: name,
            type: type
        },
        include: {
            members: true
        }
    })
    return updatedEnsemble;
}

export default updateEnsemble;