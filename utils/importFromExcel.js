import Excel from 'exceljs';

import { validateEmail } from 'utils';

import { CAL, STATES } from './constants';
import { getDashedValue, localizeDate } from './calendarUtils';

export const FIELDS = {
    firstName:           { type: 'string',   caption: "First Name",          show: false, width: "150px" },
    lastName:           { type: 'string',   caption: "Last Name",           show: false, width: "150px" },
    middleName:         { type: 'string',   caption: "Middle Name",         show: false, width: "150px" },
    suffix:              { type: 'string',   caption: "Suffix",               show: false, width: "150px" },
    aka:                { type: 'string',   caption: "AKA",                 show: false, width: "150px" },
    birthday:           { type: 'dateonly', caption: "Birthday",            show: false, width: "150px" },
    sex:                { type: 'list',     caption: "Sex",                 show: false, width: "150px" },
    height:             { type: 'height',   caption: "Height",              show: false, width: "150px" },
    weight:             { type: 'int',      caption: "Weight",              show: false, width: "150px" },
    race:               { type: 'list',     caption: "Race",                show: false, width: "150px" },
    ethnicity:          { type: 'string',   caption: "Ethnicity",           show: false, width: "150px" },
    hair:               { type: 'list',     caption: "Hair Color",          show: false, width: "150px" },
    eyes:               { type: 'list',     caption: "Eye Color",           show: false, width: "150px" },
    email:              { type: 'string',   caption: "Email",               show: false, width: "150px" },
    phonenumber:        { type: 'phone',    caption: "Phone Number",        show: false, width: "150px" },
    street:             { type: 'string',   caption: "Street",              show: false, width: "150px" },
    street2:            { type: 'string',   caption: "Unit",                show: false, width: "150px" },
    city:               { type: 'string',   caption: "City",                show: false, width: "150px" },
    state:              { type: 'state',    caption: "State",               show: false, width: "150px" },
    postalCode:         { type: 'string',   caption: "Zip",                 show: false, width: "150px" },
    country:            { type: 'string',   caption: "Country",             show: false, width: "150px" },
    poBox:              { type: 'string',   caption: "PO Box",              show: false, width: "150px" },
    addressType:        { type: 'list',     caption: "Address Type",        show: false, width: "150px" },
    ensemble:           { type: 'list',     caption: "Ensemble",            show: false, width: "200px" },
    membershipType:     { type: 'list',     caption: "Membership Type",     show: false, width: "150px" },
    division:           { type: 'list',     caption: "Division",            show: false, width: "200px" },
    membershipStart:    { type: 'date',     caption: "Membership Start",    show: false, width: "150px" },
    membershipExpires:  { type: 'date',     caption: "Membership Expires",  show: false, width: "150px" },
    emailAddress:       { conform: 'email' },
    phone:              { conform: 'phonenumber' },
    street1:            { conform: 'street' },
    zipCode:            { conform: 'postalCode' },
    zip:                { conform: 'postalCode' },
    membershipEnd:      { conform: 'membershipExpires' },
    membershipEnds:     { conform: 'membershipExpires' },
}


export const validateValue = (value, fieldName, options) => {
    // console.log("validating value:", value, fieldName)
    switch (FIELDS[fieldName].type) {
        case 'string':
            if (value === null || value === "") {
                if (fieldName === 'firstName' || fieldName === 'lastName') {
                    return [null, 'fail']
                }
                return [value, 'pass']
            }
            if (fieldName === 'email') {
                let emailtext = value.text ? value.text : value;
                return [emailtext, validateEmail(emailtext) ? 'pass' : 'fail']
            }
            return [value.toString(), 'pass'];

        case 'phone':
            if (value === null) return ["", 'pass']
            const phoneNumber = value.toString().replace(/[^0-9]*/gm, '')
            if (phoneNumber.length >= 7) {
                return [phoneNumber, 'pass'];
            }
            return [value, 'fail']

        case 'height':
            let validatedHeight;
            if (value === null) return [0, 'pass'];
            if (!/[^0-9]/gm.test(value.toString())) {
                return [parseInt(value), 'pass']

            } else {
                //import value is marked up
                const h = value.toString();

                const findFormat = () => {
                    let separator;
                    if (h.includes("'")) separator = "'"
                    if (h.includes("’")) separator = "’"
                    if (h.includes("f")) separator = "f"
                    if (h.includes("-")) separator = "-"
                    if (h.includes(". ")) separator = ". "
                    if (h.includes(".")) separator = ".";
                    switch (separator) {
                        case "'":
                        case "’":
                        case "f":
                        case "-":
                        case ". ":
                            return { type: "separator", separator }
                        case ".":
                        default:
                            return { type: "point", separator }
                    }
                }
                const format = findFormat()

                // console.log({ format })


                switch (format.type) {
                    case "separator":
                        const getFeetAndInches = (sep) => {
                            const sepIndex = h.indexOf(sep)
                            const feet = h.slice(0, sepIndex).replace(/[^0123456789.]*/gm, '');
                            const inch = h.slice(sepIndex + 1).replace(/[^0123456789.]*/gm, '');
                            return { feet, inch }
                        }
                        const { feet, inch } = getFeetAndInches(format.separator)
        
                        // console.log({ feet }, { inch })

                        validatedHeight = (parseInt(feet) * 12) + parseInt(inch);
                        break;
                    case "point":
                        validatedHeight = Math.round(parseFloat(h.replace(/[^0123456789.]*/gm, '')) * 12)
                        break;
                    default:
                        validatedHeight = 0
                }
            }
            // console.log({validatedHeight})
            return isNaN(validatedHeight) ? [value, 'fail'] : [validatedHeight, 'warn'];

        case 'int':
            if (value === null) return 0;
            return isNaN(parseInt(value)) ? [value, 'fail'] : [parseInt(value), 'pass'];
        
        case 'dateonly':
            if (value === null) return [null, 'pass'];
            if (!isNaN(new Date(value).getMonth())) return [localizeDate(value).toLocaleDateString(), 'pass'];
            if (value.toString().match(/[A-z]/g)) {
                let d = value.toString();
                let month = 'none';
                CAL.month.short.some(mon => {
                    const foundIt = d.includes(mon)
                    if (foundIt) month = mon;
                    return foundIt
                })
                if (month != 'none') {
                    const monthIndex = CAL.month.short.indexOf(month)
                    const nums = d.match(/[0-9]+/g);
                    let date;
                    let year = new Date().getFullYear()
                    nums.forEach(num => {
                        const n = parseInt(num)
                        if (n > 31 || n === 0) {
                            if (n + 2000 > year) {
                                year = 1900 + n
                            } else {
                                year = 2000 + n
                            }
                        } else {
                            date = n;
                        }
                    })
                    const birthdayValue = new Date(year, monthIndex, date)
                    return [birthdayValue.toLocaleDateString(), 'warn']
                }
            }
            return [value, 'fail']

        case 'date':
            if (value === null) return [null, 'pass'];
            const pattern = /(st|rd|th)/g
            if (!isNaN(new Date(value).getMonth())) { // if it IS a number...
                const dateString = localizeDate(value).toLocaleDateString();
                return [dateString, 'pass']
            } else if (!isNaN(new Date(value.replace(pattern, "")))) {
                return [new Date(value.replace(pattern, "")).toLocaleDateString(), 'warn']
            } else {
                return [value, 'fail'];
            }

        case 'state':
            if (value === null) return [null, 'pass'];
            if (value.length > 2) {
                return STATES.long[value.toLowerCase()] ? [STATES.long[value.toLowerCase()], 'pass'] : [value, 'fail'];
            } else if (value.length === 2) {
                return STATES.short[value.toUpperCase()] ? [value.toUpperCase(), 'pass'] : [value, 'fail'];
            } else {
                return [value, 'fail']
            }
        
        case 'list':
            console.log("evaluating list item:", fieldName, value, options)
            switch (fieldName) {
                case 'membershipType':
                    if (value === null) return [null, 'pass']
                    return [value, 'pass']
                case 'division':
                case 'ensemble':
                    if (value === null) {
                        if (options.length === 1) return [options[0], 'warn'];
                        return [null, 'pass']
                    }
                    if (options.map(o => o.name).includes(value)) {
                        return [value, 'pass'];
                    }
                    break;
                case "sex":
                case "eyes":
                case "hair":
                case "race":
                    if (value === null || value === "") return [null, 'pass']
                    //
                    if (options.includes(value)
                        || options.map(o => o.name).includes(value)
                        || options.map(o => o.type).includes(value))
                    {
                        return [value, 'pass'];
                    }
                    //
                    return [value, 'fail']
                default:
                    break;
            }
            return [value, 'fail']
        
        default:
            return null;

    }

}

export const readXlsx = async (fileData, ensembleName, optionSets) => {  // value.toString
    
    const records = []
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(fileData)
        .then(() => {
            const importSheet = workbook.getWorksheet('members');
            const worksheet = importSheet ? importSheet : workbook.worksheets[0];
            const topRow = worksheet.getRow(1);
            const headerSet = {}
            topRow.eachCell((cell, c) => {
                const validatedHeader = Object.keys(FIELDS).find(field => {
                    return cell.value.toLowerCase().replace(/\s/g, "") === field.toLowerCase();
                })
                if (validatedHeader) {
                    const header = FIELDS[validatedHeader].conform ? FIELDS[validatedHeader].conform : validatedHeader;
                    headerSet[header] = c
                }
            })

            //if 'ensemble' header is not present in xls file, add
            if (!Object.keys(headerSet).includes('ensemble')) headerSet.ensemble = 'implicit'
            //if 'membershipType' heeader is not present in xls file, add
            if (!Object.keys(headerSet).includes('membershipType')) headerSet.membershipType = 'implicit'

            worksheet.eachRow((row, r) => {
                if (r > 1) {
                    const member = { bio: {}, address: {}, membership: {} }
                    const rowValues = {}
                    row.eachCell((cell, c) => {
                        rowValues[c] = cell.value;
                    })
                    Object.keys(FIELDS).forEach(field => {
                        if (headerSet[field]) {
                            const rowValue = Number.isInteger(headerSet[field]) ? rowValues[headerSet[field]] : null
                            console.log({ field }, {rowValue})
                            const validatedValue = validateValue(
                                rowValue === undefined ? "" : rowValue,
                                field,
                                optionSets[field]
                            );
    
                            switch (field) {
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
                                    member.address[field] = validatedValue;
                                    break;
                                case 'membershipType':
                                    console.log("membership type:", validatedValue)
                                    member.membership[field] = validatedValue
                                    break;
                                case 'membershipStart':
                                case 'membershipExpires':
                                    member.membership[field] = validatedValue;
                                    break;
                                case 'ensemble':
                                    console.log("ensemble:", validatedValue)
                                    let ensembleValue = validatedValue
                                    if (validatedValue[0] === null) {
                                        if (ensembleName != null && ensembleName != "") {
                                            console.log("ensemble name:", ensembleName, ensembleName != "")
                                            ensembleValue = [ensembleName, 'pass']
                                        } else if (headerSet.membershipType || headerSet.membershipStart || headerSet.membershipExpires || headerSet.division) {
                                            ensembleValue = ["REQUIRED", 'fail']
                                        }
                                        ensembleValue = [null, 'pass']
                                    }
                                    member.ensemble = ensembleValue;
                                    break;
                                case 'division':
                                    member.division = validatedValue;
                                    break;
                                default:
                                    member.bio[field] = validatedValue;
                            }
                        }

                    })
                    

                    records.push(member)
                }
            })
        })
    
    return records;
}

export const readXlsxFile = async (file, optionSets) => {
    const data = await new Response(file).arrayBuffer();
    return readXlsx(data, file.get('ensembleName'), optionSets);

}