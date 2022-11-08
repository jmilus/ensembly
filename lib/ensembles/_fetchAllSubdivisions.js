import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();


const getAllSubdivisions = async (divId) => {
    const fetchedSubdivisions = await prisma.subDivision.findMany({
        where: {
            divisionId: divId ? parseInt(divId) : undefined
        }
    })
    
    return fetchedSubdivisions;
}

export default getAllSubdivisions;