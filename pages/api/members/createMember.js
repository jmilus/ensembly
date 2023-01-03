import prisma from '../../../lib/prisma';

export const createNewMember = async (data) => {
    const { firstName, middleName, lastName, suffix, aka, birthday, sex, height, weight, race, ethnicity, hair, eyes, email, phonenumber, street, street2, city, state, postalCode, country, poBox } = data;

    const newMember = await prisma.member.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            suffix: suffix,
            aka: aka ? aka : `${firstName} ${lastName}${suffix ? " " + suffix : ""}`,
            uniqueName: firstName + middleName + lastName + suffix,
            memberBio: {
                create: {
                    birthday: birthday ? new Date(birthday) : undefined,
                    sex: sex,
                    height: height,
                    weight: weight,
                    race: race,
                    ethnicity: ethnicity,
                    hair: hair,
                    eyes: eyes
                }
            },
            emails: {
                create: {
                    email: email ? email : ""
                }
            },
            phoneNumbers: {
                create: {
                    phonenumber: phonenumber ? phonenumber : ""
                }
            },
            addresses: {
                create: {
                    street: street,
                    street2: street2,
                    city: city,
                    state: state,
                    postalCode: postalCode,
                    country: country,
                    poBox: poBox
                }
            }
        }
    })
    return newMember;
}

const createMember = async (req, res) => {

    let response = [];
    try {
        response = await createNewMember(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'failed to create member', err });
    }
}

export default createMember;