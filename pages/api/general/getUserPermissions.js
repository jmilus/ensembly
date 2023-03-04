import prisma from '../../../lib/prisma';

export const loadUserPermissions = async (email) => {
    return prisma.profile.findUnique({
        where: { userEmail: email },
        include: {
            permissions: true
        }
    })
}

const getUserPermissions = async (req, res) => {
    let response = [];
    try {
        response = await loadUserPermissions(req.body.email);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getUserPermissions;