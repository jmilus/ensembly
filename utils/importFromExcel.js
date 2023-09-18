import Excel from 'exceljs';

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

export const readXlsx = async (fileData, ensembleId) => {
    // console.log({fileData}, {ensembleId})
    const importSet = []
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
                                        validatedValue = STATES[cell.value.toLowerCase()] ? STATES[cell.value.toLowerCase()] : undefined;
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
                    // if (uploadReturn.fields) {
                    //     Object.keys(uploadReturn.fields).forEach(key => {
                    //         record[key] = uploadReturn.fields[key];
                    //     })
                    // }
                    record.ensembleId = ensembleId ? ensembleId : undefined;
                    importSet.push(record);
                }
            })
        })
    
    return importSet;
}

export const memberImportFromExcel = async (importData, ensembleId) => {
    const file = await importData.arrayBuffer();
    const xlsxData = readXlsx(file, ensembleId);
    
    return xlsxData;

}