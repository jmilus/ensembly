import Excel from 'exceljs';

import { validateEmail } from 'utils';

import { STATES } from './constants';

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
    street1:        { conform: 'street' },
    street2:        { type: 'string' },
    city:           { type: 'string' },
    state:          { type: 'state' },
    postalCode:     { type: 'string' },
    country:        { type: 'string' },
    poBox:          { type: 'string' },
    zipCode:        { conform: 'postalCode' },
    zip:            { conform: 'postalCode' },
    addressType:    { type: 'string' },
    membershipType: { type: 'string' },
    membershipStart: { type: 'date' },
    ensemble:       { type: 'string' },
    division:       { type: 'string' }
}

const validateValue = (value, fieldName) => {
    switch (fieldSet[fieldName].type) {
        case 'string':
            if (fieldName === 'email') {
                let emailtext = ''
                if (value.text) {
                    emailtext = validateEmail(value.text) ? value.text : "";
                } else {
                    emailtext = validateEmail(value) ? value : "";
                }
                return emailtext;
            }
            return value === null ? "" : value.toString();

        case 'phone':
            return value === null ? "" : value.toString().replace(/[^0-9]*/gm, '');

        case 'height':
            let validatedHeight;
            if (value === null) return null;
            if (!value.toString().match(/[^0-9]/)) {
                //import value is pure number
                return parseInt(value)

            } else {
                //import value is marked up
                const h = value.toString();
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
                        validatedHeight = (parseInt(feet) * 12) + parseInt(inch);

                    case "point":
                        validatedHeight = (parseInt(feet) * 12) + (12 * Math.floor(parseInt(inch)/10));

                    default:
                        validatedHeight = 0
                }
            }
            return isNaN(validatedHeight) ? 0 : validatedHeight;

        case 'int':
            return isNaN(parseInt(value)) ? null : parseInt(value);

        case 'date':
            if (value === null) return null;
            if (!isNaN(new Date(value).getMonth())) {
                const dateString = new Date(value);
                return new Date(dateString.setHours(dateString.getHours() + (new Date().getTimezoneOffset() / 60)))
            } else {
                return null;
            }

        case 'state':
            if (value === null) return null;
            if (value.length > 2) {
                return STATES[value.toLowerCase()] ? STATES[value.toLowerCase()] : undefined;
            } else {
                return value.toUpperCase();
            }
        default:
            return null;

    }

}

export const readXlsx = async (fileData) => { 
    const records = []
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(fileData)
        .then(() => {
            const importSheet = workbook.getWorksheet('members');
            const worksheet = importSheet ? importSheet : workbook.worksheets[0];
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

            worksheet.eachRow((row, r) => {
                if (r > 1) {
                    const member = { bio: {}, address: {}, membership: {} }
                    const rowValues = {}
                    row.eachCell((cell, c) => {
                        rowValues[c] = cell.value;
                    })
                    Object.keys(headerSet).forEach((colIndex) => {
                        const fieldName = headerSet[colIndex];
                        const validatedValue = validateValue(rowValues[colIndex] ? rowValues[colIndex] : null, fieldName);

                        switch (fieldName) {
                            case 'email':
                                member.email = validatedValue;
                                break;
                            case 'phonenumber':
                                member.phonenumber = validatedValue;
                                break;
                            case 'street':
                            case 'street2':
                            case 'city':
                            case 'state':
                            case 'postalCode':
                            case 'country':
                            case 'poBox':
                                member.address[fieldName] = validatedValue;
                                break;
                            case 'membershipType':
                            case 'membershipStart':
                                member.membership[fieldName] = validatedValue;
                                break;
                            case 'ensemble':
                                member.ensemble = validatedValue;
                                break;
                            case 'division':
                                member.division = validatedValue;
                                break;
                            default:
                                member.bio[fieldName] = validatedValue;
                        }
                    })

                    records.push(member)
                }
            })
        })
    
    return records;
}

export const memberImportFromExcel = async (importData) => {
    const file = await importData.arrayBuffer();
    const xlsxData = readXlsx(file);
    
    return xlsxData;

}