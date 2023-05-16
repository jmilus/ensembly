'use client'

import Link from 'next/link'
import { useContext } from 'react';
import { useRouter, usePathname } from "next/navigation";

import { GlobalContext } from "../../components/ContextFrame";
import {Form, Text, File, Select} from '../../components/Vcontrols';
import TabControl, { Tab } from '../../components/TabControl';

import memberImportFromExcel from '../../lib/memberImportFromExcel';
import Modal2 from '../../components/Modal2';

const EnsembleNav = ({ ensemble, schema }) => {
    const router = useRouter();
    

    const loadSchema = async (schemaId) => {
        // console.log(schemaId)
        router.push(`/ensembles/${ensemble.id}/viewschema/${schemaId}`);
    }

    return (
        <div className="sub-nav">
            <article style={{padding: "10px", flex: "0 0 10em"}}>
                <Link href="/ensembles"><i>arrow_back</i>All Ensembles</Link>
                <h1>{ensemble.name}</h1>
            </article>
            <TabControl type="accordion">
                <Tab id="General" onLoad={() => router.push(`ensembles/${ensemble.id}/`)}>
                    <article style={{padding: "10px"}}>
                        <Modal2
                            modalButton={<button><i>upload</i><span>Upload Members</span></button>}
                            title="Upload Members From Excel File"
                        >
                                <Form id="upload-members-form" APIURL="/members/uploadMembers" additionalIds={{ensembleId: ensemble.id}} >
                                    <section className="modal-fields">
                                        <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                                    </section>
                                    <section className="modal-buttons">
                                        <button name="submit">Submit</button>
                                    </section>
                                </Form>
                        </Modal2>
                    </article>
                </Tab>
                <Tab id="Calendar" onLoad={() => router.push(`ensembles/${ensemble.id}/`)}>
                    <div>Events!</div>
                </Tab>
                <Tab id="Schemas" onLoad={() => router.push(`ensembles/${ensemble.id}/viewschema/x`)}>
                    <article style={{ padding: "10px" }}>
                        <Select id="schema-select" field="schema" label="Schema" value={schema.id} options={ensemble.schema} extraAction={(selectedSchema) => loadSchema(selectedSchema)} />
                        <fieldset className="buttons">
                            <Modal2
                                modalButton={<button><i>add_box</i><span>New Schema</span></button>}
                                title="Create New Schema"
                            >
                                <Form id="create-schema-form" APIURL="/ensembles/createSchema" additionalIds={{ ensembleId: ensemble.id }}>
                                    <section className="modal-fields">
                                        <Text id="schema-name" name="name" label="New Schema Name" />
                                    </section>
                                    <section className="modal-buttons">
                                        <button name="submit">Submit</button>
                                    </section>
                                </Form>
                            </Modal2>
                            <Modal2
                                modalButton={<button><i>library_add</i><span>Copy Schema</span></button>}
                                title="Copy Schema"
                            >
                                <Form id="copy-schema-form" APIURL="/ensembles/copySchema" additionalIds={{ ensembleId: ensemble.id, schemaId: schema.id }}>
                                    <section className="modal-fields">
                                        <Text id="schema-name" name="name" label="New Schema Name" />
                                    </section>
                                    <section className="modal-buttons">
                                        <button name="submit">Copy</button>
                                    </section>
                                </Form>
                            </Modal2>
                        </fieldset>
                    </article>
                </Tab>
            </TabControl>
            
                
        </div>
    )
}

export default EnsembleNav;