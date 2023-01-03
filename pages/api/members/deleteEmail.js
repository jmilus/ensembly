import prisma from '../../../lib/prisma';

export const deleteOneEmail = async (data) => {
    const { id } = data;
    console.log("email id:", id);
    const deletedEmail = await prisma.email.delete({
        where: {
            id: id
        },
        select: { id: true, address: true }
    })

    return deletedEmail;
}

const deleteEmail = async (req, res) => {
    console.log("id received:", req.body.id);
    let response = [];
    try {
        response = await deleteOneEmail(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default deleteEmail;