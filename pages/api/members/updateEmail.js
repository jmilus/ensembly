import prisma from '../../../lib/prisma';

export const updateOneEmail = async (data) => {
    const { id, email, rank, memberId } = data;

    const emailId = id ? id : "new";

    const payload = {
        email: email || "",
        rank: rank,
        member: {
            connect: { id: memberId }
        }
    }

    const memberEmail = await prisma.email.upsert({
        where: { id: emailId },
        update: payload,
        create: payload
    })
    return memberEmail;
}

const updateEmail = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneEmail(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateEmail;