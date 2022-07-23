import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const createEnsemble = async (data) => {
    const { name, type } = data;
    
    const newEnsemble = await prisma.ensemble.create({
        data: {
            name: name,
            type: {
                connect: {
                    id: parseInt(type)
                }
            }
        }
    })
    return newEnsemble;
}

export default createEnsemble;