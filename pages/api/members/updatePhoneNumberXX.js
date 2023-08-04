import prisma from '../../../lib/prisma';

export const updateOnePhoneNumber = async (data) => {
    const { id, prefix, phonenumber, rank, memberId } = data;

    const phoneId = id ? id : "new";

    const payload = {
        prefix: prefix,
        phonenumber: phonenumber || "",
        rank: rank,
        member: {
            connect: { id: memberId }
        }
    }

    const memberPhoneNumber = await prisma.phoneNumber.upsert({
        where: { id: phoneId },
        update: payload,
        create: payload
    })
    return memberPhoneNumber;
}

const updatePhoneNumber = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOnePhoneNumber(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updatePhoneNumber;