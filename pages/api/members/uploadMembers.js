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
        const { firstName, middleName, lastName, suffix, aka, birthday, sex, height, weight, race, ethnicity, hair, eyes, email, phonenumber, street, street2, city, state, postalCode, country, poBox, ensemble } = newMember;
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
                }
            }
        })
    }))

    console.log({newMembers})
    return newMembers;
}

const fieldSet = {
    firstName:       {type: 'string'},
    middleName:     {type: 'string'},
    lastName:       {type: 'string'},
    suffix:          {type: 'string'},
    aka:            {type: 'string'},
    birthday:       {type: 'date'},
    sex:            {type: 'string'},
    height:         {type: 'int'},
    weight:         {type: 'int'},
    race:           {type: 'string'},
    ethnicity:      {type: 'string'},
    hair:           {type: 'string'},
    eyes:           {type: 'string'},
    email:          {type: 'string'},
    phonenumber:    {type: 'string'},
    street:         {type: 'string'},
    street2:        {type: 'string'},
    city:           {type: 'string'},
    state:          {type: 'string'},
    postalCode:     {type: 'string'},
    country:        {type: 'string'},
    poBox:          {type: 'string'}
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
            const worksheet = workbook.getWorksheet('Sheet1');

            // validate headers
            const topRow = worksheet.getRow(1);
            const headerSet = {}
            topRow.eachCell((cell, c) => {
                const validatedHeader = Object.keys(fieldSet).find(field => {
                    return cell.value.toLowerCase().replace(/\s/g, "") === field.toLowerCase();
                })
                if (validatedHeader) {
                    headerSet[c] = validatedHeader;
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
                                case 'int':
                                    validatedValue = isNaN(parseInt(cell.value)) ? undefined : parseInt(cell.value);
                                    break;
                                case 'date':
                                    if (!isNaN(new Date(cell.value).getMonth())) {
                                        const dateString = new Date(cell.value).toISOString();
                                        validatedValue = new Date(parseInt(dateString.slice(0, 4)), parseInt(dateString.slice(5, 7)) - 1, parseInt(dateString.slice(8, 10)))
                                    }
                                    break;
                                default:
                                    break;
                            }
                            record[headerSet[c]] = validatedValue;
                        }
                    })
                    if (!record.aka) record.aka = `${record.firstName} ${record.lastName}${record.suffix ? " " + record.suffix : ""}`
                    if (record.birthday) console.log(record.birthday)
                    // if (importSet.fields?.context) record.ensemble = importSet.fields.context.ensemble
                    importSet.push(record);
                }
            })
            console.log({ importSet });
        })
    
    let importResult;
    if (importSet.length > 0) {
        console.log("importSet has records")
        try {
            importResult = await createManyMembers(importSet)
                .then(async () => await prisma.$disconnect());
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