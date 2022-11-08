import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const updateMember = async (data) => {
    const { id, firstName, middleName, lastName, name, birthday, sex, height, weight, race, ethnicity, hair, eyes } = data;
    const payload = {
        birthday: birthday ? new Date(birthday) : null,
        sex: sex,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        race: race,
        ethnicity: ethnicity,
        hair: hair,
        eyes: eyes
    }

    const updatedMember = await prisma.member.update({
        where: { id: id },
        data: {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            name: name,
            memberBio: {
                upsert: {
                    create: payload,
                    update: payload
                }
            }
        },
        include: {
            memberBio: true,
            memberships: true,
            phoneNumbers: true,
            addresses: true,
            emails: true
        }
    })
    return updatedMember;
}

export default updateMember;