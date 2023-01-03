import prisma from '../../../lib/prisma';

export const deleteOnePhoneNumber = async (data) => {
    const { id } = data;
    console.log("phone number id:", id);
    const deletedPhoneNumber = await prisma.phonenumber.delete({
        where: {
            id: id
        },
        select: { id: true, phonenumber: true }
    })

    return deletedPhoneNumber;
}

const deletePhoneNumber = async (req, res) => {
    console.log("id received:", req.body.id);
    let response = [];
    try {
        response = await deleteOnePhoneNumber(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default deletePhoneNumber;