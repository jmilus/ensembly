import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const createEnsemble = async (data) => {
    const { name, typeId } = data;
    
    const newEnsemble = await prisma.ensemble.create({
        data: {
            name: name,
            type: {
                connect: {
                    id: parseInt(typeId)
                }
            }
        }
    })
    return newEnsemble;
}

export default createEnsemble;