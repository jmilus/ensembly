import { PrismaClient, Race } from '@prisma/client'

const prisma = new PrismaClient();

const getEnums = async () => {

    return Race;
}

export default getEnums;