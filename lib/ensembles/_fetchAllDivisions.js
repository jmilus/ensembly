import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();


const getAllDivisions = async (typeId) => {
    const fetchedSections = await prisma.division.findMany({
        where: {
            ensembleTypeId: typeId ? parseInt(typeId) : undefined
        }
    })
    
    return fetchedSections;
}

export default getAllDivisions;