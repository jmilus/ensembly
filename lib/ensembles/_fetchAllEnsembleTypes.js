import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const getAllEnsembleTypes = async () => {
    const fetchedEnsembleTypes = await prisma.ensembleType.findMany()
    //return fetchedEnsembleTypess;
    
    return fetchedEnsembleTypes;
}

export default getAllEnsembleTypes;