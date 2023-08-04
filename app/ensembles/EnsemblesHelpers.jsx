'use client'

import Link from 'next/link'
import { useRouter, usePathname } from "next/navigation";

import { supabase } from '../../lib/supabase-client';

import {Form, Text, File, Select} from '../../components/Vcontrols';
import TabControl, { Tab } from '../../components/TabControl';

import memberImportFromExcel from '../../lib/memberImportFromExcel';
import ModalButton from '../../components/ModalButton';

const EnsembleNav = ({ ensemble, lineup }) => {
    const router = useRouter();
    const path = usePathname()

    console.log({ensemble})

    const loadLineup = async (lineupId) => {
        console.log({lineupId})
        router.push(`/ensembles/${ensemble.id}/lineup/${lineupId}`);
    }

    const upload = async (input) => {
        const logoFile = input.files[0]
        const { data, error } = await supabase.storage
            .from('Logos')
            .upload(`${ensemble.id}/logo${logoFile.name.slice(logoFile.name.lastIndexOf("."))}`, logoFile, {
                upsert: true
            })
        console.log({ data }, { error })

        if (data) {
            const urlResult = await fetch('/api/ensembles/updateEnsemble', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: ensemble.id,
                    logoUrl: data.path
                })
            })
                .then(response => response.json())
                .then(res => res)
                .catch((err, message) => console.error("hhmmm...", err, message));
            
            console.log(urlResult);
        }
    }

    const lineupId = path.includes("lineup/") ? path.slice(path.indexOf("lineup/") + 7) : null;
    const startTab = lineupId ? 2 : path.includes("calendar") ? 1 : 0;

    return (
        <div className="sub-nav">
            <article style={{padding: "10px", flex: "0 0 10em"}}>
                <Link href="/ensembles"><i>arrow_back</i>All Ensembles</Link>
                <h1>Ensemble Profile</h1>
            </article>
            <TabControl type="accordion" startTab={startTab}>
                <Tab id="General" onLoad={() => router.push(`/ensembles/${ensemble.id}/`)}>
                    <article style={{ padding: "10px" }}>
                        <fieldset className="buttons button-chain column">
                            <ModalButton
                                modalButton={<><i>upload</i><span>Upload Members</span></>}
                                title="Upload Members From Excel File"
                            >
                                <Form id="upload-members-form" APIURL="/members/uploadMembers" auxData={{ensembleId: ensemble.id}} >
                                    <section className="modal-fields">
                                        <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                                    </section>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="upload-members-form">Submit</button>
                                </section>
                            </ModalButton>
                            <ModalButton
                                modalButton={<><i>upload</i><span>Upload Logo</span></>}
                                title="Upload Logo"
                            >
                                <Form id="upload-logo-form" altSubmit={(f) => upload(f)} debug>
                                    <File id="logo-upload-control" name="logo" handling="upload" fileTypes={[".jpg", ".jpeg", ".gif", ".png"]} />
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="upload-logo-form">Upload</button>
                                </section>
                            </ModalButton>
                        </fieldset>
                    </article>
                </Tab>
                <Tab id="Calendar" onLoad={() => router.push(`/ensembles/${ensemble.id}/`)}>
                    <div>Events!</div>
                </Tab>
                <Tab id="Lineups" onLoad={() => router.push(`/ensembles/${ensemble.id}/lineup/x`)}>
                    <article style={{ padding: "10px" }}>
                        <Select id="lineup-select" name="lineup" label="Lineup" value={lineupId} options={ensemble.Lineup} extraAction={(selectedLineup) => loadLineup(selectedLineup)} />
                        <fieldset className="buttons button-chain column">
                            <ModalButton
                                modalButton={<><i>add_box</i><span>New Lineup</span></>}
                                title="Create New Lineup"
                            >
                                <Form id="create-lineup-form" APIURL={`/api/ensembles/${ensemble.id}/lineup`} METHOD="POST" auxData={{ ensemble: ensemble.id }} followPath={`/ensembles/${ensemble.id}/lineup/$slug$`}>
                                    <section className="modal-fields">
                                        <Text id="lineup-name" name="name" label="New Lineup Name" />
                                    </section>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="create-lineup-form">Submit</button>
                                </section>
                            </ModalButton>
                            <ModalButton
                                modalButton={<><i>library_add</i><span>Copy Lineup</span></>}
                                title="Copy Lineup"
                            >
                                <Form id="copy-lineup-form" METHOD="POST" followPath={`/ensembles/${ensemble.id}/lineup/$slug$`}>
                                    <section className="modal-fields">
                                        <Text id="lineup-name" name="name" label="New Lineup Name" />
                                    </section>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="copy-lineup-form">Copy</button>
                                </section>
                            </ModalButton>
                        </fieldset>
                    </article>
                </Tab>
            </TabControl>
            
                
        </div>
    )
}

export default EnsembleNav;