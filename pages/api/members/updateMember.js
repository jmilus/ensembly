import prisma from '../../../lib/prisma';

export const updateOneMember = async (data) => {
    const { id, firstName, middleName, lastName, aka, suffix, birthday, sex, height, weight, race, ethnicity, hair, eyes } = data;

    const payload = {
        birthday: birthday,
        sex: sex,
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        race: race,
        ethnicity: ethnicity,
        hair: hair,
        eyes: eyes
    }
    
    const currentMember = await prisma.member.findUnique({
        where: { id: id }
    })
    if (!currentMember) return false;

    const uniqueName = [
        firstName || currentMember.firstName,
        middleName || currentMember.middleName,
        lastName || currentMember.lastName,
        suffix || currentMember.suffix
    ].join("");

    const updatedMember = await prisma.member.update({
        where: { id: id },
        data: {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            aka: aka,
            uniqueName: uniqueName,
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

const updateMember = async (req, res) => {
    console.log("update request data:", req.body);
    
    let response = [];
    try {
        response = await updateOneMember(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateMember;