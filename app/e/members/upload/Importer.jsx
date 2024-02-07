'use client'

import { useState, useEffect, useRef } from 'react';
import { readXlsxFile, validateValue, FIELDS } from 'utils/importFromExcel';
import { Form, Text, Number, File, Select, CheckBox, DateTime, DateOnly } from 'components/Vcontrols';
import SubNav from 'components/SubNav';

import useStatus from 'hooks/useStatus';
import { getDashedValue } from 'utils/calendarUtils';

const ImportRow = ({ row, r, optionSets, selectRow }) => {
    const [rowValues, setRowValues] = useState(row)

    // console.log({ optionSets })
    // console.log({rowValues})

    const updateCell = (field, value, options) => {
        const newRowValues = { ...rowValues }
        newRowValues[field] = validateValue(value, field, options);
        setRowValues(newRowValues);
    }

    const getInputControl = (field, value, validState, rowIndex) => {
        // console.log("getting input controls:", { field }, { value })

        const importStyling = (status) => {
            switch (status) {
                case 'warn':
                    return { backgroundColor: 'hsl(var(--color-h2) / 0.25)', ['--edge-color']: 'var(--color-h2)', color: 'hsl(var(--color-h2))' }
                case 'fail':
                    return { backgroundColor: 'hsl(0 100% 50% / 0.25)', ['--edge-color']: '0 100% 50%', color: 'red' }
                default:
                    return {}
            }
        }

        const props = { id: `${rowIndex}-${field}`, name: field, value: value, style: importStyling(validState), extraAction: (v) => updateCell(field, v, optionSets[field]) }
        const thisEnsemble = optionSets.ensemble.find(ens => ens.name === rowValues.ensemble[0])
        switch (field) {
            
            case "membershipType":
                const membershipOptions = optionSets.membershipType.filter(option => {
                    return thisEnsemble ? option.ensembles.includes(thisEnsemble.id) : false
                })
                // console.log({membershipOptions})
                const membershipMatch = membershipOptions.some(mem => mem.name === value)
                return <Select {...props} style={membershipMatch ? {} : importStyling('fail')} options={membershipOptions} promptText={value} />
            
            case "division":
                const thisMembershipType = optionSets.membershipType.find(mem => mem.name === rowValues.membershipType[0])
                const divisionOptions = optionSets.division.filter(div => {
                    if (!thisEnsemble || !thisMembershipType) return false
                    if (div.ensemble != thisEnsemble.id) return false
                    if (thisMembershipType.capacity.includes(div.capacity)) return true
                    
                })
                // console.log({ divisionOptions })
                const thisDivision = divisionOptions.find(div => div.name === value);
                let divInEnsemble = false;
                let divCapMatch = false;
                if (thisDivision) {
                    divInEnsemble = thisDivision.ensemble === thisEnsemble.id;
                    divCapMatch = thisMembershipType.capacity.includes(thisDivision.capacity)
                }
                return <Select {...props} style={divInEnsemble && divCapMatch ? {} : importStyling('fail') } options={divisionOptions} promptText={value} />
            
            case "ensemble":
            case "addressType":
            case "sex":
            case "hair":
            case "eyes":
            case "race":
                return <Select {...props} options={optionSets[field]} promptText={value} />
            
            case "email":
            case "phonenumber":
                return <Text {...props} format={field} />
            
            case "height":
            case "weight":
                return <Number {...props} format={field} />

            case "birthday":
                return <Text {...props} value={getDashedValue(value, true)} format="date" innerStyle={{ textAlign: "right" }} debug/>

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

    const submitRow = (payload) => {
        console.log(payload)
        const jsonData = {};
        payload.forEach((value, key) => {
            if (!Reflect.has(jsonData, key)) {
                jsonData[key] = value;
                return;
            }
            if (!Array.isArray(jsonData[key])) {
                jsonData[key] = [jsonData[key]];
            }
            jsonData[key].push(value);
        });
        console.log({ jsonData });
    }

    return (
        <div style={{display: "flex"}}>
            <CheckBox id={`row-${r}-select`} name={`select-${r}`} value={row.selected} extraAction={selectRow} style={{ fontSize: "1.5em", position: "sticky", left: "0px", background: "var(--gray2)" }} />
            {
                Object.keys(FIELDS).map((field, c) => {
                    if (FIELDS[field].show) {

                        const cell = getInputControl(field, rowValues[field][0], rowValues[field][1], r)
                        return (
                            <div key={c} className={`col-${field}`} style={{ marginBottom: 0, minWidth: FIELDS[field].width }}>
                                {
                                    cell
                                }
                            </div>
                        )
                    }
                })
            }

        </div>

        // <Form id={`row-form-${r}`} altSubmit={submitRow} style={{ display:"flex" }}>
        //     <button name="submit" className="fit">Save</button>
        // </Form>
    )
}

const Importer = ({optionSets}) => { 
    const [importedMembers, setImportedMembers] = useState([]);
    const tableRef = useRef()
    const status = useStatus()

    console.log({ importedMembers })
    
    const processFile = async (f) => {
        status.loading()
        const members = await readXlsxFile(f, optionSets);
        console.log("processed data:", members)
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
        console.log({allSelected})
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
        const cells = {selected: member.selected}
        Object.keys(FIELDS).forEach(field => {
            if (!field.conform) {
                const fieldValue = member.bio[field] ||
                    member.membership[field] ||
                    member.address[field] ||
                    member[field]
                if (fieldValue) FIELDS[field].show = true
                cells[field] = fieldValue || [];
            }
        })
        return cells
    })

    const uploadControls = 
        <div style={{ width: "500px", padding: "40px", margin: "auto" }}>
            <Form id="upload-members-form" altSubmit={(f) => processFile(f)} >
                <article >
                    <File id="file-selector" name="members" label="Select .xlsx File" fileTypes="xlsx" isRequired />
                    <Select id="ensemble-select" name="ensembleName" label="Ensemble" options={optionSets.ensemble} />
                    <section style={{marginTop: "10px", justifyContent: "flex-end"}}>
                        <button name="submit" className="fit">Upload</button>
                    </section>
                </article>
            </Form>
        </div>
    
    const importedResultsGrid =
        <div style={{width: "100%", overflow: "hidden"}}>
            <section style={{ height: "100%" }}>
                <article style={{overflow: "scroll"}}>
                    <div style={{ display: "flex", position: "sticky", top: "0px", background: "var(--gray1)", width: "fit-content", zIndex: 1 }}>
                        <CheckBox id="select-all" value={importedMembers.every(im => im.selected)} extraAction={selectAll} style={{ fontSize: "1.5em", position: "sticky", left: "0px", background: "var(--gray1)" }}/>
                        {
                            Object.keys(FIELDS).map((field, b) => {
                                if (FIELDS[field].show) return (
                                    <div key={b} className={`col-${field}`} style={{ minWidth: FIELDS[field].width, padding: "10px" }}>{FIELDS[field].caption}</div>
                                )
                            })
                        }
                    </div>
                    {
                        rows.map((row, r) => {
                            return (
                                <ImportRow key={r} row={row} r={r} optionSets={optionSets} selectRow={(v) => selectRow(r, v)} />
                                // <section key={r}>
                                // </section>
                            )
                        })
                    }
                </article>
            </section>

        </div>

    return (
        <div id="page-base">
            <div id="page-header" >
                <SubNav
                    caption="Import Members"
                    root="members"
                    // navNodes={navNodes}
                    buttons={[
                        <button
                            key="update"
                            name="update-selected"
                            className="fit"
                        >
                            <i>checklist</i><span>Mass Update</span>
                        </button>,
                        <button
                            key="upload"
                            name="upload-members"
                            className="fit"
                            onClick={() => console.log(importedMembers)}
                        >
                            <i>upload</i><span>Upload All</span>
                        </button>
                    ]}
                />
            </div>
            <div id="page-frame">
                <div id="page">
                    {importedMembers.length > 0
                        ?
                        importedResultsGrid
                        :
                        uploadControls
                    }

                </div>

            </div>

        </div>
    )
}

export default Importer;