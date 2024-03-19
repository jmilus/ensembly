'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { readXlsxFile, validateValue, FIELDS } from 'utils/importFromExcel';
import { Form, Text, Number, File, Select, CheckBox, Collection } from 'components/Vcontrols';

import useStatus from 'hooks/useStatus';
import { getDashedValue, validateBirthday } from 'utils/calendarUtils';
import ModalButton from 'components/ModalButton';
import PopupMenu from 'components/PopupMenu';

import { cloneDeep, isEmpty } from 'lodash';

const validityStyling = {
    match: { backgroundColor: 'hsl(var(--color-h2) / 0.25)', ['--edge-color']: 'var(--color-h2)', color: 'hsl(var(--color-h2))', fontStyle: 'italic' },
    fail: { backgroundColor: 'hsl(0 100% 50% / 0.25)', ['--edge-color']: '0 100% 50%', color: 'red' },
    dupe: { backgroundColor: 'hsl(270 100% 50% / 0.25)', ['--edge-color']: '270 100% 50%', color: 'hsl(270 100% 50%)'},
    flag: { backgroundColor: 'hsl(30 100% 50% / 0.25)', ['--edge-color']: '30 100% 50%', color: 'hsl(30 100% 50%)' },
    ready: { backgroundColor: 'hsl(var(--color-p) / 0.15)', ['--edge-color']: 'var(--color-p)', color: 'hsl(var(--color-p))' },
    sleep: { backgroundColor: 'hsl(var(--grayx) 50% / 0.15)', ['--edge-color']: 'var(--grayx) 50%', color: 'hsl(var(--grayx) 50%)', fontStyle: 'italic' },
    select: { backgroundColor: 'hsl(var(--gray0) / 0.25)', ['--edge-color']: 'var(--grayx) 50%', color: 'var(--gray9)' }
}


const ImportRow = ({ row, r, selectRow, updateFieldValue, handleMatch }) => { // 'sleep'
    const [showPopup, setShowPopup] = useState(false)
    const menuRef = useRef()

    // console.log({ optionSets })
    // console.log({row})

    const getInputControl = (field, value, validState, options, rowIndex, readonly) => {
        // console.log("getting input controls:", { field }, { value })
        const props = { id: `${rowIndex}-${field}`, name: field, value: value, style: readonly ? validityStyling.sleep : validityStyling[validState], extraAction: (v) => updateFieldValue(r, field, v, options), readonly: readonly}

        switch (field) {
            
            case "membershipType":
            case "division":
            case "ensemble":
            case "addressType":
            case "sex":
            case "hair":
            case "eyes":
            case "race":
                return <Select {...props} options={options} promptText={value} extraAction={(v) => updateFieldValue(r, field, v.caption, options)} />
            
            case "email":
            case "phonenumber":
                return <Text {...props} format={field} />
            
            case "height":
            case "weight":
                return <Number {...props} format={field} />

            case "birthday":
                return <Text {...props} value={getDashedValue(value, true)} innerStyle={{ textAlign: "right" }} validateOnBlur={true} validationFunction={validateBirthday} />

            case "membershipStart":
            case "membershipExpires":
                return <Text {...props} innerStyle={{ textAlign: "right" }} />

            case "firstName":
            case "middleName":
            case "lastName":
            case "suffix":
            case "aka":
            case "street":
            case "street2":
            case "city":
            case "state":
            case "postalCode":
            case "poBox":
            case "country":
            default:
                return <Text {...props} />
        }
    }


    let rowValid = 'ready'
    if (!row.ignore) {
        if (row.flag) rowValid = 'flag'
        if (row.match) rowValid = 'match'
        if (row.dupe) rowValid = 'dupe'
        if (row.fail) rowValid = 'fail'
    }


    let checkboxStyle = { fontSize: "1.5em", position: "sticky", left: "0px", backgroundColor: 'var(--gray2)' }
    if (row.match) checkboxStyle = {...checkboxStyle, borderRadius: "15px 0 0 15px", overflow: "hidden", minWidth: "44px" }
    const rowValidStyling = validityStyling[rowValid]

    return (
        <div style={{ display: "flex" }} className={row.match ? "double" : ""}>
            <div style={checkboxStyle} >
                {row.needsAttention ? 
                    <>
                        <div ref={menuRef} style={{ ...validityStyling.match, height: "100%", width: "44px", display: "flex" }}>
                            <i style={{ margin: "auto" }} onClick={() => setShowPopup(true)}>pending</i>
                        </div>
                        {showPopup &&
                            <PopupMenu id={`row-${r}-menu`} parentRef={menuRef} hideMe={() => setShowPopup(false)} >
                                <div className="select-option" style={{ ['--hover-color']: 'var(--mint5)', padding: "10px 15px" }} onClick={() => handleMatch(r, 'create-new')} title="Create a new member and keep the existing record.">Create New Member</div>
                                <div className="select-option" style={{ ['--hover-color']: 'var(--mint5)', padding: "10px 15px" }} onClick={() => handleMatch(r, 'merge')} title="For fields in the existing record that are blank, update to the new values.">Merge Into Member</div>
                                <div className="select-option" style={{ ['--hover-color']: 'var(--mint5)', padding: "10px 15px" }} onClick={() => handleMatch(r, 'overwrite')} title="Update the existing record with the new values (blanks are ignored).">Overwrite Member</div>
                                <div className="select-option" style={{ ['--hover-color']: 'var(--mint5)', padding: "10px 15px" }} onClick={() => handleMatch(r, 'discard')} title="Remove this duplicate record from the import list.">Discard Duplicate</div>
                            </PopupMenu>
                        }
                    </>
                    :
                    <>
                        {!row.match && !row.ignore ?
                            <CheckBox id={`row-${r}-select`} name={`select-${r}`} value={row.select} extraAction={selectRow} style={{ backgroundColor: "var(--gray2)", ...rowValidStyling, height: "100%", width: "44px" }} boxStyle={{color: rowValidStyling.color}} />
                            :
                            <div style={{ height: "100%", width: "44px", display: "flex" }}>
                            
                            </div>
                        }
                    </>
                }
            </div>
            {
                Object.keys(FIELDS).map((field, c) => {
                    // console.log("row field:", field, row[field])
                    if (FIELDS[field].show) {
                        const { value, dupe, valid } = row[field]
                        const options = row[field].options ? row[field].options : []
                        const displayValue = dupe ? dupe : value;
                        const matchValid = row.match ? 'match' : valid;
                        const cell = getInputControl(field, displayValue, matchValid, options, r, row.ignore)
                        const ogCell = row.match ? getInputControl(field, row.match[field], 'match', [], r, true) : null
                        return (
                            <div key={c} className={`col-${field}`} style={{ marginBottom: 0, minWidth: FIELDS[field].width }}>
                                {cell}
                                {ogCell &&
                                    ogCell
                                }
                            </div>
                        )
                    }
                })
            }
            
        </div>
    )
}


const HeaderCell = ({ field, updateColumn, sortRows, hasSelected }) => {
    const [showMenu, setShowMenu] = useState(false)
    const headerRef = useRef()

    const handleSubmit = (input) => {
        updateColumn(input, field)
        setShowMenu(false)
    }

    const handleSort = (field, dir) => {
        sortRows(field, dir)
        setShowMenu(false)
    }

    return (
        <div className={`col-${field}`} style={{ minWidth: FIELDS[field].width, padding: "0 10px", display: "flex", alignItems: "center" }}>
            <div ref={headerRef} className={`column-header ${field}`}>
                <div className={`column-header-button${showMenu ? " show" : ""}`} onClick={() => setShowMenu(true)}>
                    <i style={{color: "white"}}>arrow_drop_down</i>
                </div>
                { showMenu &&
                    <PopupMenu id={`column-${field}-menu`} parentRef={headerRef} hideMe={() => setShowMenu(false)} direction="down left" >
                        <div className="select-option" style={{ ['--hover-color']: 'var(--mint6)', padding: "10px"}} onClick={() => handleSort(field, 'asc')}><i>vertical_align_top</i><span>Sort Ascending</span></div>
                        <div className="select-option" style={{ ['--hover-color']: 'var(--mint6)', padding: "10px"}} onClick={() => handleSort(field, 'desc')}><i>vertical_align_bottom</i><span>Sort Descending</span></div>
                        {hasSelected
                            ? 
                            <Form id="mass-update-form" altSubmit={handleSubmit} >
                                <div style={{ display: "flex", alignItems: "center", background: "var(--gray0)", padding: "0 3px 3px" }} >
                                    <Text id="mass-update-input" name="value" label="Bulk Update" placeholder="Update selected to..." innerStyle={{ padding: "5px 10px", height: "2em", borderBottom: "none" }} autofocus={true} />
                                    <button name="submit" style={{ margin: "17px 0 0 1px", ['--edge-color']: "var(--mintx) 60%", borderRadius: "0 5px 5px 0", height: "2em" }}><i>arrow_forward</i></button>
                                </div>
                            </Form>
                            :
                            <div className="select-option" style={{ ['--hover-color']: 'var(--mint6) 60%'}} >
                                <Text label="Bulk Update" value="No rows selected" innerStyle={{ padding: "5px 10px", height: "2em", borderBottom: "none", fontStyle: "italic", color: "var(--gray5)" }} readonly />
                            </div>
                        }
                        
                    </PopupMenu>
                }
                <span>{FIELDS[field].caption}</span>
            </div>
        </div>
    )
}


const Importer = ({optionSets, members, ensembleTypes, capacities}) => { 
    const [importedMembers, setImportedMembers] = useState([]);
    const [filter, setFilter] = useState({})
    const recordsDisplay = useRef()
    const router = useRouter()
    const status = useStatus()

    console.log({ optionSets }, { members }, { ensembleTypes }, {capacities})

    console.log({ importedMembers }, { members }, { FIELDS })

    const filterMembers = (key) => {
        const newFilter = { ...filter }
        if (newFilter[key]) {
            delete newFilter[key]
        } else {
            const filterArray = importedMembers.map((member, m) => {
                if (member[key]) return member.index
            })
            newFilter[key] = filterArray
        }
        setFilter(newFilter)
    }

    const sortRows = (field, dir) => {
        const newImportedMembers = [...importedMembers]

        newImportedMembers.sort((m1, m2) => {
            if (['height', 'int', 'date'].includes(FIELDS[field].type)) {
                return m1[field].value - m2[field].value;
            } else {
                return m1[field].value.localeCompare(m2[field].value)
            }
        })

        if (dir === 'desc') newImportedMembers.reverse()
        setImportedMembers(newImportedMembers)
    }

    const validateImportedMembers = (newMembers) => { //match

        const uniqueNames = newMembers.map(member => member.uniqueName)

        newMembers.forEach((member, m) => {
            // console.log({ member })
            
            const uniqueNamesCopy = [...uniqueNames]
            uniqueNamesCopy.splice(m, 1)
            member.dupe = uniqueNamesCopy.includes(member.uniqueName) ? true : false

            if (member.ignore) return;

            member.flag = false;
            member.fail = false;
    
            Object.keys(FIELDS).forEach(field => {
                let fieldValue = member[field]
    
                if (field.conform) return;
                if (fieldValue) {
                    FIELDS[field].show = true
                    const thisEnsemble = optionSets.ensemble.find(ens => ens.name === member.ensemble.value)
                    switch (field) {
                        case 'ensemble':
                            fieldValue.valid = thisEnsemble ? 'pass' : 'fail';
                            fieldValue.options = optionSets.ensemble
                            break;
                        case 'membershipType':
                            const membershipOptions = optionSets.membershipType.filter(option => {
                                return thisEnsemble ? option.ensembles.includes(thisEnsemble.id) : false
                            })
                            fieldValue.options = membershipOptions;
                            // console.log({membershipOptions})
                            const membershipMatch = membershipOptions.some(mem => mem.name === fieldValue.value)
                            fieldValue.valid = membershipMatch ? 'pass' : 'fail'
                            break;
                        case 'division':
                            const thisMembershipType = optionSets.membershipType.find(mem => mem.name === member.membershipType.value)
                            const divisionOptions = optionSets.division.filter(div => {
                                if (!thisEnsemble || !thisMembershipType) return false
                                if (div.ensemble != thisEnsemble.id) return false
                                if (thisMembershipType.capacity.includes(div.capacity)) return true
                                
                            })
                            fieldValue.options = divisionOptions
                            // console.log({ divisionOptions })
                            const thisDivision = divisionOptions.find(div => div.name === fieldValue.value);
                            let divInEnsemble = false;
                            let divCapMatch = false;
                            if (thisDivision) {
                                divInEnsemble = thisDivision.ensemble === thisEnsemble.id;
                                divCapMatch = thisMembershipType.capacity.includes(thisDivision.capacity)
                            }
                            fieldValue.valid = divInEnsemble && divCapMatch ? 'pass' : 'fail'
                            break;
                        case 'firstName':
                        case 'middleName':
                        case 'lastName':
                        case 'suffix':
                            fieldValue.valid = member.dupe && !member.match ? 'dupe' : 'pass'
                            break;
                        default:
                            if (optionSets[field]) {
                                const isRequired = FIELDS[field].required
                                const isInOptionsSet = optionSets[field].includes(fieldValue.value)
                                const isEmpty = fieldValue.value === "" || fieldValue.value === null
                                fieldValue.valid = isInOptionsSet || !isRequired && isEmpty ? 'pass' : 'fail'
                                fieldValue.options = optionSets[field]
                            }
                            break;

                    }
                    
                    
                    if (fieldValue.valid === 'flag') member.flag = true
                    if (fieldValue.valid === 'fail') member.fail = true
                    member.ready = !member.flag && !member.fail && !member.dupe
                    member[field] = fieldValue || [];
                } else {
                    FIELDS[field].show = false;
                }
            })
        })

        setImportedMembers(newMembers)

    }

    const updateFieldValue = (rowIndex, field, value, options) => {
        const newImportedMembers = [ ...importedMembers ]
        const newRowValues = { ...newImportedMembers[rowIndex] };
        
        newRowValues[field] = validateValue(value, field, options);
        if (field === 'firstName' ||
            field === 'middleName' ||
            field === 'lastName' ||
            field === 'suffix') newRowValues.uniqueName = (newRowValues.firstName?.value || "") + '-' + (newRowValues.middleName?.value || "") + '-' + (newRowValues.lastName?.value || "") + '-' + (newRowValues.suffix?.value || "")
        newImportedMembers[rowIndex] = newRowValues
        validateImportedMembers(newImportedMembers);
    }

    const updateColumn = (formData, field) => {
        const value = formData.get('value')
        console.log(field, value)
        const newImportedMembers = [...importedMembers]
        newImportedMembers.forEach(member => {
            if (member.select) member[field] = validateValue(value, field, member[field].options);
        })
        validateImportedMembers(newImportedMembers);
    }

    const handleMatch = (index, mode) => {
        const dupeMember = { ...importedMembers[index] };
        dupeMember.needsAttention = false;
        const newMember = cloneDeep(dupeMember)
        const newImportedMembers = [...importedMembers]
        delete newMember.match
        newMember.select = false;

        switch (mode) {
            case 'create-new':
                const ogMember = cloneDeep(dupeMember.match)

                Object.keys(FIELDS).forEach(field => {
                    if (FIELDS[field].type) {
                        const tempValue = ogMember[field]
                        ogMember[field] = {value: tempValue}
                        ogMember[field].valid = 'pass'
                    }
                    if (newMember[field] && typeof newMember[field] === 'object') newMember[field] = validateValue(newMember[field].value, field, newMember[field].options)
                })
                ogMember.ignore = true;
                newImportedMembers.splice(index, 1, ogMember, newMember)
                setFilter("")
                recordsDisplay.current.scrollTo({
                    top: index * 39,
                    behavior: 'smooth'
                })
                break;
            case 'merge':
            case 'overwrite':
                Object.keys(FIELDS).forEach(field => {
                    if (FIELDS[field].type) {
                        if (dupeMember.match[field] && typeof newMember[field] === 'object') {
                            let handledValue = dupeMember.match[field];
                            if (mode === 'overwrite' || dupeMember.match[field] === "" || dupeMember.match[field] === null) {
                                handledValue = newMember[field].value
                            } 
                            newMember[field] = validateValue(handledValue, field, newMember[field].options)
                        }
                    }
                })
                newMember.id = dupeMember.match.id

                newImportedMembers.splice(index, 1, newMember)
                break;
            case 'discard':
                newImportedMembers.splice(index, 1)
                break;
            default:
                break;
        }

        // console.log({ importedMembers }, {newImportedMembers})
        validateImportedMembers(newImportedMembers)
        
    }

    const processFile = async (f) => {
        status.loading({caption: "importing Data..."})
        const newMembers = await readXlsxFile(f, optionSets);
        // console.log("processed data:", newMembers)
        status.saved({ caption: "Successfully read file" })
        
        const newImportedMembers = newMembers.map(newMember => {
            const matchingIndex = members.findIndex(matchingMember => {
                return matchingMember.uniqueName === newMember.uniqueName
            })

            if (matchingIndex >= 0) {
                newMember.match = members[matchingIndex];
                newMember.needsAttention = true;
            } else {
                newMember.select = false;
            }
            
            return newMember;
        })
        validateImportedMembers(newImportedMembers);
    }

    const selectRow = (r, v) => {
        const selectedMembers = [...importedMembers]
        selectedMembers[r].select = v
        if (selectedMembers[r].hasOwnProperty('select')) setImportedMembers(selectedMembers)
    }

    const areAllSelected = () => {
        const filteredMembers = importedMembers.filter(im => {
            if (!im.hasOwnProperty('select')) return false;
            if (isEmpty(filter)) return true;
            return Object.values(filter).every(f => f.includes(im.index))
        })

        if (filteredMembers.length === 0) return false;
        return filteredMembers.every(fm => fm.select)
    }

    const selectAll = () => {
        const allSelected = areAllSelected()
        console.log({ allSelected })
        const membersCopy = [...importedMembers]
        membersCopy.forEach(member => {
            if (member.hasOwnProperty('select')) {
                if (isEmpty(filter)) {
                    member.select = !allSelected
                } else {
                    if (Object.values(filter).every(f => f.includes(member.index))) member.select = !allSelected
                }
            }
                
        })
        setImportedMembers(membersCopy);
    }

    const removeSelectedMembers = () => {
        console.log("removing!")
        const newImportedMembers = importedMembers.filter(member => !member.select)
        setImportedMembers(newImportedMembers);
    }

    const uploadMembers = async (mode) => {
        const uploadableMembers = importedMembers.map(member => {
            if (mode === 'selected' && !member.select) return null;
            const memberObj = {}
            Object.keys(member).forEach(field => {
                let fieldValue = member[field];
                if (typeof member[field] === 'object') {
                    fieldValue = member[field].value
                }
                memberObj[field] = fieldValue
            })
            return memberObj;
        }).filter(member => member != null).filter(member => !member.ignore)
        console.log({ uploadableMembers })
        status.loading({caption: "Uploading..."})
        //
        const importResults = await fetch('/api/members/uploadMembers', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(uploadableMembers)
        })
        .then(response => response.json())
            .then(res => {
                if (res.error) throw res.error;
                status.saved({ caption: "Success!" })
                if (mode === 'selected') {
                    removeSelectedMembers()
                } else {
                    router.push('/e/members')
                }
                return res;
            })
            .catch(error => {
                console.error("failed to import members...", error);
                status.error({ caption: "Upload Failed" })
                return Error(error);
            })
        console.log({importResults})
    }

    const changeFields = (field, show) => {
        const newImportedMembers = [...importedMembers]
        Object.values(newImportedMembers).forEach(member => {
            if (show) {
                if (!member[field]) {
                    member[field] = { value: "", valid: 'pass' }
                    // if (member.match) {
                    //     const matchingMember = members.find(matchingMember => matchingMember.id === member.match.id)
                    //     member[field].value = matchingMember[field] || null
                    // }
                }
            } else {
                if (member[field]) delete member[field]
            }
        })
        validateImportedMembers(newImportedMembers)
    }


    let allSafe = true;
    let filterSafe = true;
    let selectionSafe = true;

    const counters = {
        select: { num: 0, icon: "check_circle", caption: "Selected", message: "" },
        fail: { num: 0, icon: "cancel", caption: "Errors", message: "Rows with errors must be repaired in order to upload." },
        dupe: { num: 0, icon: "toll", caption: "Duplicate", message: "Fields that must be unique cannot be found in more than one row." },
        match: { num: 0, icon: "join_full", caption: "Match", message: "Rows that have matching records can be merged, modified or discarded." },
        flag: { num: 0, icon: "flag_circle", caption: "Flags", message: "Rows with flag can be imported, but review is recommended." },
        ready: { num: 0, icon: "recommend", caption: "Ready", message: "" },
    }
    
    importedMembers.forEach((member, m) => {
        const notSafe = member.fail || member.dupe || member.needsAttention

        if (notSafe) allSafe = false;

        Object.keys(counters).forEach(counterKey => {
            counters[counterKey].num += member[counterKey] ? 1 : 0
            if(filter === counterKey && notSafe) filterSafe = false
        })

        if (member.select && notSafe) selectionSafe = false

    })

    const termPeriod = [
        { id: 1, value: "Week" },
        { id: 2, value: "Month" },
        { id: 3, value: "Year" }
    ]

    console.log({counters})

    const uploadControls = 
        <div style={{flex: "unset", display: "flex", flexWrap: "wrap"}}>
            <div style={{ flex: 1, padding: "0 50px", minWidth: "400px" }}>
                <h1>Import Members</h1>
                <p>
                    {`
                    Use this tool to import a membership roster from an Excel (.xlsx) file.
                    Once imported, you will have an opportunity to review the imported records and repair any improperly formatted values.
                    `}
                </p>
                <p>
                    {`Note that All members must have a unique name. If two or more members are named similarly ("John Smith"), consider adding a middle name, or suffix.`}
                </p>
                <p>
                    Your import file may include the below fields. Other fields will be ignored.
                </p>
                <ul>
                    <li>First Name  <span style={{color: "red"}}>(required)</span></li>
                    <li>Middle Name</li>
                    <li>Last Name <span style={{color: "red"}}>(required)</span></li>
                    <li>Suffix</li>
                    <li>AKA (a nickname or display name)</li>
                    <li>Birthday</li>
                    <li>Sex</li>
                    <li>Height</li>
                    <li>Weight</li>
                    <li>Race</li>
                    <li>Ethnicity</li>
                    <li>Hair</li>
                    <li>Eyes</li>
                    <li>Email</li>
                    <li>Phone Number</li>
                    <li>Street</li>
                    <li>Unit</li>
                    <li>City</li>
                    <li>State</li>
                    <li>Postal code</li>
                    <li>Country</li>
                    <li>PO Box</li>
                    <li>Address Type (Options: Home, Work, Temporary, Secondary, Old)</li>
                    <li>Ensemble (if other than what you indicate in the drop down on the right)</li>
                    <li>Membership Type</li>
                    <li>Division</li>
                    <li>Membership Start (will default to today if omitted)</li>
                    <li>Membership Expires (if required by Membership Type, will default to the soonest expiration period)</li>
                </ul>
            </div>
            <div style={{ flex: 0, height: "75%", border: "0.5px solid black", margin: "auto"}}></div>
            <div style={{ flex: 1, padding: "10px", display: "flex", justifyContent: "center", alignItems: "center", minWidth: "400px" }}>
                {optionSets.ensemble.length > 0 && optionSets.membershipType.length > 0
                    ?
                    <div style={{ width: "500px", padding: "40px", margin: "auto" }}>
                        <Form id="upload-members-form" altSubmit={(f) => processFile(f)} >
                            <article >
                                <File id="file-selector" name="members" label="Select .xlsx file" fileTypes="xlsx" isRequired />
                                <p>You may optionally indicate an Ensemble and Membership Type, which will be applied to each imported member where these values are unspecified.
                                </p>
                                <Select id="ensemble-select" name="ensembleId" label="Ensemble" options={optionSets.ensemble.map(ens => { return { ...ens, value: ens.id } })}>
                                    <Select id="membershipType-select" name="membershipTypeId" label="Membership Type" options={optionSets.membershipType} filterKey="ensembles"/>
                                </Select>
                                <section style={{marginTop: "10px", justifyContent: "flex-end"}}>
                                    <button name="submit" className="fit">Import</button>
                                </section>
                            </article>
                        </Form>
                    </div>
                    :
                    <div>
                        <p>
                            Before importing members, you must:
                        </p>
                        <ol>
                            {optionSets.ensemble.length === 0 &&
                                <li>
                                    <ModalButton
                                        renderButton="Create an Ensemble"
                                        title="Create New Ensemble"
                                        buttonClass="link-like-button"
                                    >
                                        <Form id="create-new-ensemble-form" APIURL="/api/ensembles" METHOD="POST" >
                                            <section className="modal-fields inputs">
                                                <Text id="newEnsembleName" name="name" label="Ensemble Name" />
                                                <Select id="newEnsembleType" name="type" label="Ensemble Type" options={ensembleTypes} />
                                            </section>
                                        </Form>
                                        <section className="modal-buttons">
                                            <button name="submit" className="fit" form="create-new-ensemble-form">Create Ensemble</button>
                                        </section>
                                    </ModalButton>
                                </li>
                            }
                            {optionSets.membershipType.length === 0 &&
                                <li>
                                    <ModalButton
                                        renderButton="Create a Membership Type"
                                        title="Create Membership Type"
                                        buttonClass="link-like-button"
                                    >
                                        <Form id="membership-type-form" APIURL="/api/membership/types" METHOD="PUT" debug>
                                            <Text id="membership-typ-name" name="name" label="Type Name" value="" isRequired />
                                            <section className="inputs">
                                                <Number id="membership-term-length" name="term_length" label="Expires in" value={1} style={{ flex: 1 }} isRequired />
                                                <Select id="memberhsip-term-period" name="term_period" label="" options={termPeriod} value={3} style={{ flex: 5 }} isRequired />
                                            </section>
                                            <Collection id="membership-capacities" name="capacity" label="Capacities" options={capacities} isRequired />
                                            <Collection id="membership-ensembles" name="ensembles" label="Ensembles" options={optionSets.ensemble.map(ens => { return { ...ens, value: ens.id } })} isRequired />
                                        </Form>
                                        <section className="modal-buttons">
                                            <button name="submit" className="fit" form="membership-type-form">Create</button>
                                        </section>
                                    </ModalButton>
                                </li>
                            }
                        </ol>
                    </div>
                }
            </div>
        </div>
    
    
    const importedResultsGrid =
        <article style={{ width: "100%", overflow: "hidden"}}>
            <section style={{ padding: "20px 0" }}>
                <section className="space-children" style={{marginLeft: "44px"}}>
                    {
                        Object.keys(counters).map((counterKey, c) => {
                            const counter = counters[counterKey]
                            const hasCount = counter.num > 0
                            const isReady = counterKey === 'ready'
                            const isFiltering = Object.keys(filter).includes(counterKey)
                            let colorStyleName = hasCount ? counterKey : 'sleep'
                            
                            return (
                                <div key={c} className={`info-flag${Object.keys(filter).includes(counterKey) ? " on" : ""}${hasCount || isReady || isFiltering ? " show" : ""}`} style={{ ['--edge-color']: validityStyling[colorStyleName]['--edge-color'], display: "flex", alignItems: "center" }} onClick={() => filterMembers(counterKey)} title={counter.message}>
                                    <i className="big">{counter.icon}</i><span>{`${counterKey === 'match' && counter.num > 1 ? "Matches" : counter.caption}: ${counter.num}`}</span>
                                </div>
                            )
                        })
                    }
                </section>
                <div id="import-options" className="button-tray" style={{ marginLeft: "auto" }}>
                    <ModalButton
                        key="manage-columns"
                        renderButton={<><i>view_list</i><span>Manage Columns</span></>}
                        title="Manage Columns"
                        buttonClass="fit"
                    >
                        <article className="scroll column" style={{ gridTemplateColumns: "1fr 1fr"}}>
                            {
                                Object.keys(FIELDS).map((fieldKey, f) => {
                                    const field = FIELDS[fieldKey]
                                    if (field.conform) return;
                                    return <CheckBox key={f} label={field.caption} value={field.show} extraAction={(v) => changeFields(fieldKey, v)} readonly={fieldKey === 'firstName' || fieldKey === 'lastName' || (fieldKey === 'middleName' && field.show) || (fieldKey === 'suffix' && field.show)}/>
                                })
                            }
                        </article>
                    </ModalButton>
                    <ModalButton
                        key="remove-selected"
                        renderButton={<><i>remove_done</i><span>Remove Selected</span></>}
                        title="Remove Selected Rows?"
                        buttonClass="fit angry"
                        disabled={counters.select.num < 1}
                    >
                        <p>
                            Do you want to remove the selected rows from this import?
                        </p>
                        <div className="modal-buttons">
                            <button name="close_modal" className="fit angry" onClick={() => removeSelectedMembers()}>Remove</button>
                        </div>
                    </ModalButton>
                    <button
                        key="upload-selected"
                        name="upload-selected"
                        className="fit"
                        onClick={() => uploadMembers('selected')}
                        disabled={!selectionSafe || counters.select.num < 1}
                    >
                        <i>file_download_done</i><span>Upload Selected</span>
                    </button>
                    <button
                        key="upload-all"
                        name="upload-all"
                        className="fit hero"
                        onClick={() => uploadMembers()}
                        disabled={!allSafe || (filter != "" && !filterSafe)}
                    >
                        <i>upload</i><span>Upload All</span>
                    </button> 
                </div>
            </section>
            <article ref={recordsDisplay} style={{overflow: "scroll", flex: 1}}>
                <div style={{ display: "flex", position: "sticky", top: "0px", background: "var(--gray1)", width: "fit-content", minHeight: "3em", zIndex: 1 }}>
                    <div style={{ fontSize: "1.5em", minWidth: "44px", position: "sticky", left: "0px", background: "var(--gray1)", display: "flex" }}>
                        <i style={{ fontSize: "23.5px", margin: "auto", color: "var(--mint7)" }} onClick={selectAll}>{areAllSelected() ? "check_box" : counters.select.num > 0 ? "indeterminate_check_box" : "check_box_outline_blank"}</i>
                    </div>
                    {
                        Object.keys(FIELDS).map((field, b) => {
                            if (FIELDS[field].show) return (
                                <HeaderCell key={b} field={field} updateColumn={updateColumn} sortRows={sortRows} hasSelected={counters.select.num > 0} />
                            )
                        })
                    }
                </div>
                {
                    importedMembers.map((row, r) => {
                        if (Object.keys(filter).every(key => {
                            return filter[key].includes(row.index)
                        })) return (
                            <ImportRow key={r} row={row} r={r} selectRow={(v) => selectRow(r, v)} updateFieldValue={updateFieldValue} handleMatch={handleMatch} />
                        )
                        return null;
                    })
                }
            </article>

        </article>

    return (
        <div id="import-grid" style={{display: "flex", flex: 1, overflow: "hidden"}}>
            {importedMembers.length > 0
                ?
                importedResultsGrid
                :
                uploadControls
            }
        </div>
    )
}

export default Importer;