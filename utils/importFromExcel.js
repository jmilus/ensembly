import Excel from 'exceljs';

import { validateEmail } from 'utils';

import { CAL, STATES } from './constants';
import { getDashedValue, localizeDate } from './calendarUtils';

export const FIELDS = {
    firstName:           { type: 'string',   caption: "First Name",          show: false, width: "150px", required: true },
    lastName:           { type: 'string',   caption: "Last Name",           show: false, width: "150px", required: true },
    middleName:         { type: 'string',   caption: "Middle Name",         show: false, width: "150px", required: false },
    suffix:              { type: 'string',   caption: "Suffix",               show: false, width: "150px", required: false },
    aka:                { type: 'string',   caption: "AKA",                 show: false, width: "150px", required: false },
    birthday:           { type: 'dateonly', caption: "Birthday",            show: false, width: "150px", required: false },
    sex:                { type: 'list',     caption: "Sex",                 show: false, width: "150px", required: false },
    height:             { type: 'height',   caption: "Height",              show: false, width: "75px", required: false },
    weight:             { type: 'int',      caption: "Weight",              show: false, width: "150px", required: false },
    race:               { type: 'list',     caption: "Race",                show: false, width: "150px", required: false },
    ethnicity:          { type: 'string',   caption: "Ethnicity",           show: false, width: "150px", required: false },
    hair:               { type: 'list',     caption: "Hair Color",          show: false, width: "150px", required: false },
    eyes:               { type: 'list',     caption: "Eye Color",           show: false, width: "150px", required: false },
    email:              { type: 'string',   caption: "Email",               show: false, width: "200px", required: false },
    phonenumber:        { type: 'phone',    caption: "Phone Number",        show: false, width: "150px", required: false },
    street:             { type: 'string',   caption: "Street",              show: false, width: "150px", required: false },
    street2:            { type: 'string',   caption: "Unit",                show: false, width: "150px", required: false },
    city:               { type: 'string',   caption: "City",                show: false, width: "175px", required: false },
    state:              { type: 'state',    caption: "State",               show: false, width: "75px", required: false },
    postalCode:         { type: 'string',   caption: "Zip",                 show: false, width: "100px", required: false },
    country:            { type: 'string',   caption: "Country",             show: false, width: "150px", required: false },
    poBox:              { type: 'string',   caption: "PO Box",              show: false, width: "150px", required: false },
    addressType:        { type: 'list',     caption: "Address Type",        show: false, width: "150px", required: false },
    ensemble:           { type: 'list',     caption: "Ensemble",            show: false, width: "200px", required: false },
    membershipType:     { type: 'list',     caption: "Membership Type",     show: false, width: "150px", required: false },
    division:           { type: 'list',     caption: "Division",            show: false, width: "200px", required: false },
    membershipStart:    { type: 'date',     caption: "Membership Start",    show: false, width: "150px", required: false },
    membershipExpires:  { type: 'date',     caption: "Membership Expires",  show: false, width: "150px", required: false },
    emailAddress:       { conform: 'email' },
    phone:              { conform: 'phonenumber' },
    street1:            { conform: 'street' },
    zipCode:            { conform: 'postalCode' },
    zip:                { conform: 'postalCode' },
    membershipEnd:      { conform: 'membershipExpires' },
    membershipEnds:     { conform: 'membershipExpires' },
}


export const validateValue = (value, fieldName, options) => {

    if (FIELDS[fieldName].type === 'list') {
        // console.log("evaluating list item:", fieldName, value, options)
        if (options.length === 1) {
            const onlyOption = options[0].name || options[0].type || options[0]
            return [onlyOption, onlyOption === value ? 'pass' : 'warn'];
        }

        if (value === null || value === "") {
            return [null, FIELDS[fieldName].required ? 'fail' : 'pass']
        }

        if (options.includes(value)
            || options.map(o => o.name).includes(value)
            || options.map(o => o.type).includes(value))
        {
            return [value, 'pass'];
        }
        
        return [value, 'fail']
    }


    if (value === null || value === "") {
        return [value, FIELDS[fieldName].required ? 'fail' : 'pass']
    }
    switch (FIELDS[fieldName].type) {
        case 'string':
            switch (fieldName) {
                case "email":
                    let emailtext = value.text ? value.text : value;
                    return [emailtext, validateEmail(emailtext) ? 'pass' : 'fail']
                case "city":
                    let cityName = value.split(",")
                    return [cityName[0], 'pass']
                default:
                    return [value.toString(), 'pass'];
            }

        case 'phone':
            const phoneNumber = value.toString().replace(/[^0-9]*/gm, '')
            if (phoneNumber.length >= 7) {
                return [phoneNumber, 'pass'];
            }
            return [value, 'fail']

        case 'height':
            let validatedHeight;
            const h = value.toString();
    
            let arr = h.split(/[^1234567890.]/g)
            let feet = 0;
            let inches = 0;
            arr.forEach(v => {
                if (/[1234567890.]/g.test(v)) {
                    if (!feet) {
                        feet = /[.]/g.test(v) ? parseFloat(v) : parseInt(v)
                    } else if (!inches) {
                        inches = /[.]/g.test(v) ? parseFloat(v) : parseInt(v)
                    }
                }
            })

            validatedHeight = Math.round(feet * 12) + inches

            if (validatedHeight === 0) return [value, "fail"]
            if(validatedHeight < 36 || validatedHeight > 83) return [validatedHeight, "warn"]
            
            return [validatedHeight, 'pass'];

        case 'int':
            return isNaN(parseInt(value)) ? [value, 'fail'] : [parseInt(value), 'pass'];
        
        case 'dateonly':
            const dateNums = value.toLocaleString().match(/[0-9]+/g)

            if (dateNums && dateNums.length > 0) {
                
                let monthIndex;
                const monthSearch = CAL.month.short.some((mon, m) => {
                    monthIndex = m
                    return value.toString().includes(mon)
                })
                
                if (monthSearch) {
                    return [`${monthIndex + 1}-${dateNums[0]}${dateNums.length > 1 ? `-${dateNums[1]}` : ""}`, 'pass']
                } else if (dateNums.length > 1) {
                    return [`${dateNums[0]}-${dateNums[1]}${dateNums.length > 2 ? `-${dateNums[2]}` : ""}`, 'pass']
                }
            }

            return [value, 'fail']

        case 'date':
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
            const stateValue = value.trim()
            if (stateValue.length > 2) {
                return STATES.long[stateValue.toLowerCase()] ? [STATES.long[stateValue.toLowerCase()], 'pass'] : [stateValue, 'fail'];
            } else if (stateValue.length === 2) {
                return STATES.short[stateValue.toUpperCase()] ? [stateValue.toUpperCase(), 'pass'] : [stateValue, 'fail'];
            } else {
                return [stateValue, 'fail']
            }
        
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
                    headerSet[c] = header
                }
            })

            console.log({headerSet})

            //if 'ensemble' header is not present in xls file, add
            if (!Object.values(headerSet).includes('ensemble')) headerSet["100"] = 'ensemble'
            //if 'membershipType' heeader is not present in xls file, add
            if (!Object.values(headerSet).includes('membershipType')) headerSet["101"] = 'membershipType'

            const ensembleColIndex = Object.keys(headerSet).find(key => headerSet[key] === 'ensemble')

            worksheet.eachRow((row, r) => {
                if (r > 1) {
                    const member = { bio: {}, address: {}, membership: {} }
                    const rowValues = {}
                    row.eachCell((cell, c) => {
                        rowValues[c] = cell.value;
                    })
                    Object.keys(FIELDS).forEach(field => {
                        const columnNum = Object.keys(headerSet).find(key => headerSet[key] === field)
                        if (columnNum) {
                            let rowValue = ""
                            let fieldOptions = optionSets[field]
                            if (field === 'ensemble') {
                                if (ensembleName != null && ensembleName != "") rowValue = ensembleName
                            }

                            if (field === 'membershipType') {
                                const thisEnsembleName = rowValues[ensembleColIndex]
                                const thisEnsemble = optionSets.ensemble.find(ens => ens.name === thisEnsembleName)
                                fieldOptions = fieldOptions.filter(option => {
                                    return thisEnsemble ? option.ensembles.includes(thisEnsemble.id) : false
                                })
                            }

                            if (rowValues[columnNum]) rowValue = rowValues[columnNum]
                            // console.log({ field }, {rowValue}, {fieldOptions})
                            const validatedValue = validateValue(
                                rowValue === undefined ? "" : rowValue,
                                field,
                                fieldOptions,
                                rowValues
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
                                    // console.log("membership type:", validatedValue)
                                    member.membership[field] = validatedValue
                                    break;
                                case 'membershipStart':
                                case 'membershipExpires':
                                    member.membership[field] = validatedValue;
                                    break;
                                case 'ensemble':
                                    // console.log("ensemble:", validatedValue)
                                    member.ensemble = validatedValue;
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