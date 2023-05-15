import prisma from '../../../lib/prisma';

const updateOneAttendance = async (data) => {
    const { eventId, memberId, status } = data;

    const updatedAttendance = await prisma.attendance.upsert({
        where: {
            eventId_memberId: {
                eventId: eventId,
                memberId: memberId
            }
        },
        create: {
            event: { connect: { id: eventId } },
            member: { connect: { id: memberId } },
            status: status
        },
        update: {
            status: status
        }
    })

    return updatedAttendance;
}

const updateAttendance = async (req, res) => {
    console.log("update request data:", req.body);
    let response = [];
    try {
        response = await updateOneAttendance(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default updateAttendance;