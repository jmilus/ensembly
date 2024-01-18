'use client'

import { useState, useEffect, useRef } from 'react';
import { readXlsxFile, validateValue, FIELDS } from 'utils/importFromExcel';
import { Form, Text, Number, File, Select, DateTime, DateOnly } from 'components/Vcontrols';

import useStatus from 'hooks/useStatus';
import { getDashedValue } from 'utils/calendarUtils';

const ImportRow = ({row, r, optionSets}) => {
    const [rowValues, setRowValues] = useState(row)

    console.log({ optionSets })

    const updateCell = (field, value, options) => {
        const newRowValues = { ...rowValues }
        newRowValues[field] = validateValue(value, field, options);
        setRowValues(newRowValues);
    }

    const getInputControl = (field, value, validState, rowIndex) => {
        // console.log({ field }, { value })

        const importStyling = (status) => {
            switch (status) {
                case 'warn':
                    return { backgroundColor: 'hsl(var(--color-h2))', color: 'white' }
                case 'fail': 
                    return { backgroundColor: 'red', color: 'white' }
                default:
                    return {}
            }
        }

        const props = { id: `${rowIndex}-${field}`, name: field, value: value, innerStyle: importStyling(validState), extraAction: (v) => updateCell(field, v, optionSets[field]) }
        switch (field) {

            case "division":
            case "ensemble":
            case "membershipType":
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
                return <Text {...props} value={getDashedValue(value, true)} style={{textAlign: "right"}} />
            case "membershipStart":
            case "membershipExpires":
                return <Text {...props} style={{textAlign: "right"}} />
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
        <Form id={`row-form-${r}`} altSubmit={submitRow} style={{display:"flex"}} >
            {
                Object.keys(FIELDS).map((field, c) => {
                    if (FIELDS[field].show) {

                        const cell = getInputControl(field, rowValues[field][0], rowValues[field][1], r)
                        return (
                        
                            <div key={c} className={`col-${field}`} style={{ marginBottom: 0, width: FIELDS[field].width }}>
                                {
                                    cell
                                }
                            </div>
                        )
                    }
                })
            }
            <button name="submit" className="fit">Save</button>
        </Form>
    )
}

const Importer = ({optionSets}) => { 
    const [importedMembers, setImportedMembers] = useState([]);
    const tableRef = useRef()
    const status = useStatus()

    // console.log({ optionSets })
    
    const processFile = async (f) => {
        status.loading()
        const members = await readXlsxFile(f, optionSets);
        console.log("processed data:", members)
        status.saved({caption: "Successfully read file"})
        setImportedMembers(members)
        // const data = { ensembleId: f.get('ensembleId'), members}
    
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
        const cells = {}
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
            <section className="scroll">
                <table ref={tableRef}>
                    <thead>
                        <tr>
                            <th>
                                <section>
                                    {
                                        Object.keys(FIELDS).map((field, b) => {
                                            if (FIELDS[field].show) return (
                                                <div key={b} className={`col-${field}`} style={{ width: FIELDS[field].width }}>{FIELDS[field].caption}</div>
                                            )
                                        })
                                    }
                                </section>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rows.map((row, r) => {
                                return (
                                    <tr key={r}>
                                        <td>
                                            <ImportRow row={row} r={r} optionSets={optionSets} />
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </section>

        </div>

    return (
        <div id="page-base">
            <div id="page-header" className="nav-header">
                <span>Import Members</span>
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