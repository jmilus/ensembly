'use client'

import { useState } from 'react';
import { readXlsxFile, validateValue, FIELDS } from 'utils/importFromExcel';
import { Form, Text, Number, File, Select, CheckBox } from 'components/Vcontrols';
import SubNav from 'components/SubNav';

import useStatus from 'hooks/useStatus';
import { getDashedValue, validateBirthday } from 'utils/calendarUtils';
import ModalButton from 'components/ModalButton';

const validityStyling = {
    flag: { backgroundColor: 'hsl(var(--color-h2) / 0.25)', ['--edge-color']: 'var(--color-h2)', color: 'hsl(var(--color-h2))' },
    fail: { backgroundColor: 'hsl(0 100% 50% / 0.25)', ['--edge-color']: '0 100% 50%', color: 'red' },
    ready: { backgroundColor: 'hsl(var(--color-p) / 0.15)', ['--edge-color']: 'var(--color-p)', color: 'hsl(var(--color-p))' },
    sleep: { backgroundColor: 'hsl(var(--grayx) 83% / 0.15)', ['--edge-color']: 'var(--grayx) 83%', color: 'hsl(var(--grayx) 50%)' }
}

const ImportRow = ({ row, r, selectRow, updateFieldValue }) => {

    // console.log({ optionSets })
    // console.log({row})

    const getInputControl = (field, value, validState, options, rowIndex) => {
        // console.log("getting input controls:", { field }, { value })
        const props = { id: `${rowIndex}-${field}`, name: field, value: value, style: validityStyling[validState], extraAction: (v) => updateFieldValue(r, field, v, options) }

        switch (field) {
            
            case "membershipType":
            case "division":
            case "ensemble":
            case "addressType":
            case "sex":
            case "hair":
            case "eyes":
            case "race":
                return <Select {...props} options={options} promptText={value} />
            
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


    let rowValid = "";
    Object.values(row).some(col => {
        if (Array.isArray(col)) {
            if (col[1] === 'fail') {
                rowValid = 'fail'
                return true
            }
            if (rowValid === '') rowValid = col[1]
        }
    })

    const checkboxStyle = { fontSize: "1.5em", position: "sticky", left: "0px", background: "var(--gray2)" }
    const rowValidStyling = validityStyling[rowValid]

    return (
        <div style={{ display: "flex" }}>
            <div style={checkboxStyle} >
                <CheckBox id={`row-${r}-select`} name={`select-${r}`} value={row.selected} extraAction={selectRow} style={{...rowValidStyling, height: "100%"}} />
            </div>
            {
                Object.keys(FIELDS).map((field, c) => {
                    if (FIELDS[field].show) {
                        const [value, valid] = row[field]
                        const options = row[field][2] ? row[field][2] : []
                        const cell = getInputControl(field, value, valid, options, r)
                        return (
                            <div key={c} className={`col-${field}`} style={{ marginBottom: 0, minWidth: FIELDS[field].width }}>
                                { cell }
                            </div>
                        )
                    }
                })
            }

        </div>
    )
}

const MultiUpdateForm = ({ updateRows, selectedCount }) => {
    const [fieldList, setFieldList] = useState([])

    // console.log(fieldList, selectedCount)

    const availableFields = Object.keys(FIELDS).filter(field => {
        if (FIELDS[field].conform) return false;
        const fields = fieldList.map(listItem => listItem.field)
        return !fields.includes(field)
    })

    const updateFieldList = (key, field, value) => {
        const newFieldList = [...fieldList];
        const changedIndex = newFieldList.findIndex(item => item.field === field);
        newFieldList[changedIndex][key] = value;
        setFieldList(newFieldList);
    }

    const addField = () => {
        const newFieldList = [...fieldList];
        newFieldList.push({ field: "", value: "" })
        setFieldList(newFieldList)
    }

    const submit = () => {
        updateRows(fieldList)
        setFieldList([])
    }

    const remove = (field) => {
        const newFieldList = fieldList.filter(item => item.field != field)
        setFieldList(newFieldList)
    }

    return (
        <>
            <Form
                id="multi-update-form"
                altSubmit={submit}
                style={{padding: "20px 20px 10px", width: "600px"}}
            >
                <div>{`Update ${selectedCount} ${selectedCount > 1 ? 'rows' : 'row'}`}</div>
                {
                    fieldList.map((item, i) => {
                        return (
                            <section key={i} className="inputs" style={{alignItems: "center"}}>
                                <Select key={i} id={`multi-update-${item.field}-field`} value={item.field} options={[...availableFields, item.field]} extraAction={(v) => updateFieldList("field", item.field, v)} />
                                <Text id={`update-${item}-value`} name={item.field} value={item.value} extraAction={(v) => updateFieldList("value", item.field, v)}/>
                                <button onClick={() => remove(item.field)}><i>close</i></button>
                            </section>
                        )
                    })
                }
                <section style={{justifyContent: "center", marginTop: "20px"}}>
                    <button name="add-field" onClick={() => addField()} className="fit" style={{flex: 1}}><i>add</i><span>Add Field</span></button>
                </section>
            </Form>
        </>
    )
}

const Importer = ({optionSets, members}) => { 
    const [importedMembers, setImportedMembers] = useState([]);
    const status = useStatus()

    console.log({ importedMembers })

    const updateFieldValue = (rowIndex, field, value, options) => {
        const newImportedMembers = [ ...importedMembers ]
        const newRowValues = { ...newImportedMembers[rowIndex] };
        
        newRowValues[field] = validateValue(value, field, options);
        newImportedMembers[rowIndex] = newRowValues
        setImportedMembers(newImportedMembers);
    }
    
    const processFile = async (f) => {
        status.loading()
        const members = await readXlsxFile(f, optionSets);
        // console.log("processed data:", members)
        status.saved({caption: "Successfully read file"})
        setImportedMembers(members)
        // const data = { ensembleId: f.get('ensembleId'), members}
    
    }

    const selectRow = (r, v) => {
        const selectedMembers = [...importedMembers]
        selectedMembers[r].selected = v
        setImportedMembers(selectedMembers)
    }

    const selectAll = () => {
        const allSelected = importedMembers.every(im => im.selected)
        const membersCopy = [...importedMembers]
        membersCopy.forEach(member => member.selected = !allSelected)
        setImportedMembers(membersCopy);
    }

    const uploadMembers = async () => {
        //
        const importResults = await fetch('/api/members/uploadMembers', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => response.json())
            .then(res => {
                if (res.error) throw res.error;
                status.saved({ caption: "Success!" })
                return res;
            })
            .catch(error => {
                console.error("failed to import members...", error);
                status.error({ caption: "Upload Failed" })
                return Error(error);
            })
        console.log({importResults})
    }

    const rows = importedMembers.map(member => {
        // console.log({ member })
        const cells = { selected: member.selected, flags: false, failures: false };
        Object.keys(FIELDS).forEach(field => {
            if (!field.conform && member[field]) {
                let fieldValue = member[field]
                if (fieldValue) {
                    FIELDS[field].show = true
                    const thisEnsemble = optionSets.ensemble.find(ens => ens.name === member.ensemble[0])
                    switch (field) {
                        case 'ensemble':
                            fieldValue[1] = thisEnsemble ? 'pass' : 'fail';
                            fieldValue[2] = optionSets.ensemble
                            break;
                        case 'membershipType':
                            const membershipOptions = optionSets.membershipType.filter(option => {
                                return thisEnsemble ? option.ensembles.includes(thisEnsemble.id) : false
                            })
                            fieldValue[2] = membershipOptions;
                            // console.log({membershipOptions})
                            const membershipMatch = membershipOptions.some(mem => mem.name === fieldValue[0])
                            fieldValue[1] = membershipMatch ? 'pass' : 'fail'
                            break;
                        case 'division':
                            const thisMembershipType = optionSets.membershipType.find(mem => mem.name === member.membershipType[0])
                            const divisionOptions = optionSets.division.filter(div => {
                                if (!thisEnsemble || !thisMembershipType) return false
                                if (div.ensemble != thisEnsemble.id) return false
                                if (thisMembershipType.capacity.includes(div.capacity)) return true
                                
                            })
                            fieldValue[2] = divisionOptions
                            // console.log({ divisionOptions })
                            const thisDivision = divisionOptions.find(div => div.name === fieldValue[0]);
                            let divInEnsemble = false;
                            let divCapMatch = false;
                            if (thisDivision) {
                                divInEnsemble = thisDivision.ensemble === thisEnsemble.id;
                                divCapMatch = thisMembershipType.capacity.includes(thisDivision.capacity)
                            }
                            fieldValue[1] = divInEnsemble && divCapMatch ? 'pass' : 'fail'
                            break;
                        default:
                            if (optionSets[field]) {
                                fieldValue[1] = optionSets[field].includes(fieldValue[0]) || fieldValue[0] === "" ? 'pass' : 'fail'
                                fieldValue[2] = optionSets[field]
                            }
                            break;

                    }
                    if (fieldValue[1] === 'flag') cells.flags = true
                    if (fieldValue[1] === 'fail') cells.failures = true
                }
                cells[field] = fieldValue || [];
            }
        })
        return cells
    })

    let selectionSafe = true;
    let selectedCount = 0;
    let flagsCount = 0;
    let failuresCount = 0;
    rows.forEach(row => {
        if (row.selected && row.failures > 0) selectionSafe = false
        selectedCount += (row.selected ? 1 : 0)
        flagsCount += (row.flags ? 1 : 0)
        failuresCount += (row.failures ? 1 : 0)
    })

    const updateRows = (fieldsToUpdate) => {
        const newImportedMembers = [...importedMembers];
        newImportedMembers.forEach(member => {
            fieldsToUpdate.forEach(fv => {
                if (!member[fv.field]) member[fv.field] = ['', 'pass']
                if (member.selected) {
                    member[fv.field] = [fv.value, 'pass']
                }
            })
        })
        setImportedMembers(newImportedMembers);
    }

    const uploadControls = 
        <div style={{ width: "500px", padding: "40px", margin: "auto" }}>
            <Form id="upload-members-form" altSubmit={(f) => processFile(f)} >
                <article >
                    <File id="file-selector" name="members" label="Select .xlsx File" fileTypes="xlsx" isRequired />
                    <Select id="ensemble-select" name="ensembleName" label="Ensemble" options={optionSets.ensemble} />
                    <section style={{marginTop: "10px", justifyContent: "flex-end"}}>
                        <button name="submit" className="fit">Import</button>
                    </section>
                </article>
            </Form>
        </div>
    
    
    const importedResultsGrid =
        <article style={{ width: "100%", overflow: "hidden"}}>
            <section style={{ padding: "20px 0" }}>
                <section className="space-children">
                    <div className="info-flag" style={{...validityStyling[rows.length - failuresCount > 0 ? 'ready' : 'sleep'], display: "flex", alignItems: "center" }}><i className="big" style={{ marginRight: "10px" }}>check_circle</i><span>Ready for Upload:</span> <span>{rows.length - failuresCount}</span></div>
                    {flagsCount > 0 && 
                        <div className="info-flag" style={{...validityStyling['flag'], display: "flex", alignItems: "center" }}><i className="big" style={{ marginRight: "10px" }}>flag_circle</i><span>Rows with Flags:</span> <span>{flagsCount}</span></div>
                    }
                    {failuresCount > 0 &&
                        <div className="info-flag" style={{...validityStyling['fail'], display: "flex", alignItems: "center" }} title="Records with errors must be repaired in order to upload."><i className="big" style={{ marginRight: "10px" }}>error</i><span>Rows with Errors:</span> <span>{failuresCount}</span></div>
                    }
                </section>
                <div id="import-options" className="button-tray" style={{ marginLeft: "auto" }}>
                    {
                        selectedCount > 0 ?
                            <ModalButton
                                key="update"
                                renderButton={<><i>checklist</i><span>Mass Update</span></>}
                                title="Multi-Row Update"
                                buttonClass="fit"
                                buttonStyle={{['--edge-color']: 'var(--color-h2)'}}
                            >
                                <MultiUpdateForm updateRows={updateRows} selectedCount={selectedCount} />
                                <section className="modal-buttons">
                                    <button name="submit" className="fit" form="multi-update-form">Update</button>
                                </section>
                            </ModalButton>
                            :
                            <button className="fit sleeping">Multi-Row Update</button>
                    }
                    <button
                        key="upload-selected"
                        name="upload-selected"
                        className={`fit ${selectionSafe && selectedCount > 0 ? '' : 'sleeping'}`}
                        style={{['--edge-color']: 'var(--color-h2)'}}
                    >
                        Upload Selected
                    </button>
                    <button
                        key="upload-all"
                        name="upload-all"
                        className={`fit ${failuresCount > 0 ? 'sleeping' : ''}`}
                        onClick={failuresCount > 0 ? null : () => console.log(importedMembers)}
                    >
                        <i>upload</i><span>Upload All</span>
                    </button>
                    
                    
                </div>
            </section>
            <article style={{overflow: "scroll", flex: 1}}>
                <div style={{ display: "flex", position: "sticky", top: "0px", background: "var(--gray1)", width: "fit-content", zIndex: 1 }}>
                    <CheckBox id="select-all" value={importedMembers.every(im => im.selected)} extraAction={selectAll} style={{ fontSize: "1.5em", position: "sticky", left: "0px", background: "var(--gray1)" }}/>
                    {
                        Object.keys(FIELDS).map((field, b) => {
                            if (FIELDS[field].show) return (
                                <div key={b} className={`col-${field}`} style={{ minWidth: FIELDS[field].width, padding: "10px", display: "flex", alignItems: "center" }}>{FIELDS[field].caption}</div>
                            )
                        })
                    }
                </div>
                {
                    rows.map((row, r) => {
                        return (
                            <ImportRow key={r} row={row} r={r} selectRow={(v) => selectRow(r, v)} updateFieldValue={updateFieldValue} />
                        )
                    })
                }
            </article>

        </article>

    return (
        <div id="page-base">
            <div id="page-header" >
                <SubNav
                    caption="Import Members"
                    root="members"
                    // navNodes={navNodes}
                    buttons={[
                        
                    ]}
                />
            </div>
            <div id="page-frame">
                <div id="page" style={{flexDirection: "column"}}>
                    
                    <div id="import-grid" style={{display: "flex", flex: 1, overflow: "hidden"}}>
                        {importedMembers.length > 0
                            ?
                            importedResultsGrid
                            :
                            uploadControls
                        }
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Importer;