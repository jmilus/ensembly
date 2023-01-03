import prisma from '../../../lib/prisma';

export const updateOneAddress = async (data) => {
    const { id, street, street2, city, state, postalCode, rank, memberId, eventId, modelId } = data;

    let linkage, connection;
    if (memberId) {
        linkage = "member"
        connection = { connect: { id: memberId } }
    } else if (eventId) {
        linkage = "event";
        connection = { connect: { id: eventId } }
    } else if (modelId) {
        linkage = "eventModel";
        connection = { connect: { id: modelId } }
    }

    const physicalAddress = await prisma.address.upsert({
        where: { id: id || "new" },
        update: {
            street: street,
            street2: street2,
            city: city,
            state: state,
            postalCode: postalCode,
            rank: rank
        },
        create: {
            street: street,
            street2: street2,
            city: city,
            state: state,
            postalCode: postalCode,
            rank: rank,
            [linkage]: connection
        }
    })
    console.log({physicalAddress});
    return physicalAddress;
}

const updateAddress = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneAddress(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateAddress;