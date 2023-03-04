import prisma from '../../../lib/prisma';

export const createManyMembers = async (data) => {
    const newMembers = await prisma.$transaction(data.map(newMember => {
        console.log({newMember})
        const { firstName, middleName, lastName, suffix, aka, birthday, sex, height, weight, race, ethnicity, hair, eyes, email, phonenumber, street, street2, city, state, postalCode, country, poBox, ensembleId } = newMember;
        return prisma.member.create({
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
                emails: email && {
                    create: {
                        email: email
                    }
                },
                phoneNumbers: phonenumber && {
                    create: {
                        phonenumber: phonenumber
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
                },
                memberships: ensembleId ? {
                    create: {
                        ensemble: { connect: { id: ensembleId } },
                        status: "Active",
                        statusDate: new Date()
                    }
                }
                : undefined
            }
        })
    }))

    console.log({newMembers})
    return newMembers;
}

const uploadMembers = async (req, res) => {
    let importResult;
    console.log(req.body)
    if (req.body.length > 0) {
        console.log("importSet has records")
        try {
            importResult = await createManyMembers(req.body)
            res.status(201);
            res.json(importResult);
        }
        catch (err) {
            console.error({ err });
            res.status(500);
            res.json({ message: 'file upload failed', err });
        }
    } else {
        res.status(200);
        res.json({ message: "no records parsed from file" });
    }
}

export default uploadMembers;