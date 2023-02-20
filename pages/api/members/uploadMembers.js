import prisma from '../../../lib/prisma';

import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import Excel from 'exceljs';

export const config = {
    api: {
        bodyParser: false
    }
}

export const createManyMembers = async (data) => {
    const newMembers = await prisma.$transaction(data.map(newMember => {
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

const fieldSet = {
    firstName:       { type: 'string' },
    middleName:     { type: 'string' },
    lastName:       { type: 'string' },
    suffix:          { type: 'string' },
    aka:            { type: 'string' },
    birthday:       { type: 'date' },
    sex:            { type: 'string' },
    height:         { type: 'height' },
    weight:         { type: 'int' },
    race:           { type: 'string' },
    ethnicity:      { type: 'string' },
    hair:           { type: 'string' },
    eyes:           { type: 'string' },
    email:          { type: 'string' },
    emailAddress:   { conform: 'email' },
    phonenumber:    { type: 'phone' },
    street:         { type: 'string' },
    mailingAddress: { conform: 'street' },
    street2:        { type: 'string' },
    city:           { type: 'string' },
    state:          { type: 'state' },
    postalCode:     { type: 'string' },
    country:        { type: 'string' },
    poBox:          { type: 'string' },
    zipCode:        { conform: 'postalCode' },
    zip:            { conform: 'postalCode' }
}

const states = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    districtofcolumbia: 'DC',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    newhampshire: 'NH',
    newjersey: 'NJ',
    newmexico: 'NM',
    newyork: 'NY',
    northcarolina: 'NC',
    northdakota: 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    puertorico: 'PR',
    rhodeisland: 'RI',
    southcarolina: 'SC',
    southdakota: 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    virginislands: 'VI',
    washington: 'WA',
    westvirginia: 'WV',
    wisconsin: 'WI',
    wyoming: 'WY',
}



const readFile = async (req, saveLocally) => {
    const form = new formidable.IncomingForm();
    const options = {}
    if (saveLocally) {
        options.uploadDir = path.join(process.cwd(), '/public/files');
        options.keepExtensions = true;
        options.filename = (name, extension, path, form) => {
            return `${Date.now().toString()}_${path.originalFilename}`
        }
    }
    
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err)
            resolve({ fields, files });
        })

    })

}

const uploadMembers = async (req, res) => {
    try {
        await fs.readdir(path.join(process.cwd(), "/public", "/files"));
    } catch (error) {
        await fs.mkdir(path.join(process.cwd(), "/public", "/files"));
    }

    const uploadReturn = await readFile(req, true);

    console.log({ uploadReturn });

    const importSet = []
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(uploadReturn.files.file.filepath)
        .then(() => {
            const importSheet = workbook.getWorksheet('members');
            const worksheet = importSheet ? importSheet : workbook.worksheets[0];

            // validate headers
            const topRow = worksheet.getRow(1);
            const headerSet = {}
            topRow.eachCell((cell, c) => {
                const validatedHeader = Object.keys(fieldSet).find(field => {
                    return cell.value.toLowerCase().replace(/\s/g, "") === field.toLowerCase();
                })
                if (validatedHeader) {
                    headerSet[c] = fieldSet[validatedHeader].conform ? fieldSet[validatedHeader].conform : validatedHeader;
                }
            })
            // console.log({ headerSet })
            
            // create records array
            worksheet.eachRow((row, r) => {
                if (r > 1) {
                    const record = {}
                    row.eachCell((cell, c) => {
                        if (headerSet[c]) {
                            let validatedValue;
                            switch (fieldSet[headerSet[c]].type) {
                                case 'string':
                                    validatedValue = cell.value.toString();
                                    break;
                                case 'phone':
                                    validatedValue = cell.value.toString().replace(/[^0-9]*/gm, '');
                                    break;
                                case 'height':
                                    if (!cell.value.toString().match(/[^0-9]/)) {
                                        //import value is pure number
                                        validatedValue = parseInt(cell.value)
                                    } else {
                                        //import value is marked up
                                        const h = cell.value.toString();
                                        const findFormat = () => {
                                            if (h.includes("'")) return ["separator", "'"]
                                            if (h.includes("’")) return ["separator", "’"]
                                            if (h.includes("f")) return ["separator", "f"]
                                            if (h.includes("-")) return ["separator", "-"]
                                            if (h.includes(". ")) return ["separator", ". "]
                                            if (h.includes(".")) return ["point", "."];
                                        }
                                        const format = findFormat()

                                        const getFeetAndInches = (sep) => {
                                            const feet = h.slice(0, h.indexOf(sep)).replace(/[^0-9]*/gm, '');
                                            const end = h.slice(h.indexOf(sep) + 1).includes(".") ? h.indexOf(".") - 1: h.slice(h.indexOf(sep) + 1).includes("/") ? h.indexOf("/") - 1 : h.length; //have to do this because some poeple include fractions of an inch...
                                            const inch = h.slice(h.indexOf(sep) + 1, end).replace(/[^0-9]*/gm, '');
                                            return { feet, inch }
                                        }
                                        const { feet, inch } = getFeetAndInches(format[1])

                                        switch (format[0]) {
                                            case "separator":
                                                validatedValue = (parseInt(feet) * 12) + parseInt(inch);
                                                break;
                                            case "point":
                                                validatedValue = (parseInt(feet) * 12) + (12 * Math.floor(parseInt(inch)/10));
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    validatedValue = isNaN(validatedValue) ? 0 : validatedValue;
                                    break;
                                case 'int':
                                    validatedValue = isNaN(parseInt(cell.value)) ? undefined : parseInt(cell.value);
                                    break;
                                case 'date':
                                    if (!isNaN(new Date(cell.value).getMonth())) {
                                        const dateString = new Date(cell.value);
                                        validatedValue = new Date(dateString.setHours(dateString.getHours() + (new Date().getTimezoneOffset() / 60)))
                                    }
                                    break;
                                case 'state':
                                    if (cell.value.length > 2) {
                                        validatedValue = states[cell.value.toLowerCase()] ? states[cell.value.toLowerCase()] : undefined;
                                    } else {
                                        validatedValue = cell.value.toUpperCase();
                                    }
                                default:
                                    break;
                            }
                            
                            record[headerSet[c]] = validatedValue;
                        }
                    })
                    if (!record.aka) record.aka = `${record.firstName} ${record.lastName}${record.suffix ? " " + record.suffix : ""}`
                    if (uploadReturn.fields) {
                        Object.keys(uploadReturn.fields).forEach(key => {
                            record[key] = uploadReturn.fields[key];
                        })
                    }
                    importSet.push(record);
                }
            })
            // console.log({ importSet });
        })
    
    let importResult;
    if (importSet.length > 0) {
        console.log("importSet has records")
        try {
            importResult = await createManyMembers(importSet)
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