'use client'

import { useContext } from 'react';
import { useRouter, usePathname } from "next/navigation";

import { GlobalContext } from "../../components/ContextFrame";
import {Form, Text, File, Select} from '../../components/Vcontrols';
import TabControl, { Tab } from '../../components/TabControl';

import memberImportFromExcel from '../../lib/memberImportFromExcel';

const EnsembleNav = ({ ensemble, schema }) => {
    const { dispatch } = useContext(GlobalContext);
    const router = useRouter();
    const path = usePathname();

    const newSchemaModal = () => {
        const submitModal = () => {
            dispatch({
                route: "modal",
                payload: {
                    type: "hide"
                }
            })
        }
    
        const modalBody = 
            <Form id="create-schema-form" APIURL="/ensembles/createSchema" additionalIds={{ ensembleId: ensemble.id }} followUp={submitModal}>
                <section style={{ padding: "10px" }}>
                    <Text id="schema-name" field="name" label="New Schema Name" />
                    
                </section>
                <section className="modal-buttons">
                    <button name="submit">Submit</button>
                    <button name="cancel">Cancel</button>
                </section>
            </Form>
            
        
        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Schema",
                    body: modalBody
                }
            }
        })
    }
    
    const copySchemaModal = () => {
    
        const submitModal = () => {
            dispatch({
                route: "modal",
                payload: {
                    mode: "hide"
                }
            })
        }
    
        const modalBody = <Text id="schema-name" field="name" label="New Schema Name" />
            
        
        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Copy Schema",
                    body: modalBody,
                    URL: "/ensembles/copySchema",
                    additionalIds: {ensembleId: ensemble.id, schemaId: viewSchema.id}
                },
                buttons: [
                    { name: "submit", caption: "Copy Schema", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
    }
    
    const uploadMembersModal = () => {
        const submitModal = (submission) => {
            console.log({ submission });
            dispatch({
                route: "modal",
                payload: {
                    type: "hide"
                }
            })
        }
    
        const handleFileImport = async (importData) => {
            const data = await memberImportFromExcel(importData, ensemble.id);
            console.log({data})
            const importResult = await fetch('/api/members/uploadMembers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(records => {
                    console.log("records:", records)
                    return records;
                })
                .catch((err, message) => {
                    console.error('failed to remove assignment:', message);
                    return err;
                })
            
            submitModal(importResult);
        }
    
        const modalBody = 
            <Form id="upload-members-form" additionalIds={{ensembleId: ensemble.id}} altSubmit={handleFileImport} followUp={submitModal} >
                <section className="modal-fields">
                    <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                </section>
                <section className="modal-buttons">
                    <button name="submit">Submit</button>
                    <button name="cancel">Cancel</button>
                </section>
            </Form>
        
        dispatch({
            route: "modal",
            payload: {
                mode: "form",
                content: {
                    title: "Upload Members from Excel File",
                    body: modalBody,
                }
            }
        })
    }

    const loadSchema = async (schemaId) => {
        // console.log(schemaId)
        router.push(`/ensembles/${ensemble.id}/viewschema/${schemaId}`);
    }

    return (
        <div className="sub-nav">
            <div className="nav-title">{ensemble.name}</div>
            <article style={{ padding: "10px", flex: 0}}>
                <button className="icon-and-label" onClick={() => router.push("/ensembles")}><i>arrow_back</i>All Ensembles</button>
                <button className="icon-and-label" onClick={uploadMembersModal}><i>upload</i>Upload Members</button>
            </article>
            <TabControl type="accordion">
                <Tab id="General" onLoad={() => router.push(`ensembles/${ensemble.id}/`)}></Tab>
                <Tab id="Calendar" onLoad={() => router.push(`ensembles/${ensemble.id}/`)}>
                    <div>Events!</div>
                </Tab>
                <Tab id="Schemas" onLoad={() => router.push(`ensembles/${ensemble.id}/viewschema/x`)}>
                    <article style={{ padding: "10px" }}>
                        <Select id="schema-select" field="schema" label="Schema" value={schema.id} options={ensemble.schema} extraAction={(selectedSchema) => loadSchema(selectedSchema)} />
                        <fieldset className="buttons">
                            <button className="icon-and-label" onClick={() => newSchemaModal(ensemble)}><i>add_box</i>New Schema</button>
                            <button className="icon-and-label" onClick={() => copySchemaModal(ensemble)}><i>library_add</i>Copy Schema</button>
                        </fieldset>
                    </article>
                </Tab>
            </TabControl>
            
                
        </div>
    )
}

export default EnsembleNav;