import 'server-only';

import SecurityWrapper from 'components/SecurityWrapper';
import ModalButton from 'components/ModalButton';
import { Form, File, Text, Select } from 'components/Vcontrols';
import SubNav from 'components/SubNav';

import { getOneEnsemble } from '@/api/ensembles/[id]/route';

export default async function EnsembleRecordLayout(context) {
    const ensemble = await getOneEnsemble(context.params.id)
    const navNodes = [
        { caption: "General", route: `/e/ensembles/${ensemble.id}/general` },
        { caption: "Schedule", route: `/e/ensembles/${ensemble.id}/schedule` },
        { caption: "Lineup", route: `/e/ensembles/${ensemble.id}/lineup` },
        { caption: "Settings", route: `/e/ensembles/${ensemble.id}/settings` }
    ]

    const buttons = {
        general: [
            <ModalButton
                key="upload"
                modalButton={<><i>upload</i><span>Upload Members</span></>}
                buttonClass="fit"
                title="Upload Members From Excel File"
            >
                <Form id="upload-members-form" APIURL="/api/members/uploadMembers" METHOD="POST" auxData={{ensembleId: ensemble.id}}>
                    <File id="fileUpload" name="members" handling="upload" fileTypes="xlsx" isRequired />
                </Form>
                <section className="modal-buttons">
                    <button name="submit" className="fit" form="upload-members-form">Upload</button>
                </section>
            </ModalButton>
        ],
        lineup: [
            <ModalButton
                key="create-lineup"
                modalButton={<><i>add_circle</i><span>Create Lineup</span></>}
                buttonClass="fit"
                title="Create New Lineup"
            >
                <Form id="new-lineup-form" APIURL={`/api/ensembles/${ensemble.id}/lineup`} METHOD="POST" followPath={`/e/ensembles/${ensemble.id}/lineup/$slug$`} debug>
                    <Text id="lineup-name" name="name" label="Lineup Name" isRequired />
                </Form>
                <section className="modal-buttons">
                    <button name="submit" className="fit" form="new-lineup-form">Create</button>
                </section>
            </ModalButton>,
            <ModalButton
                key="duplicate-lineup"
                modalButton={<><i>library_add</i><span>Duplicate Lineup</span></>}
                buttonClass="fit"
                title="Duplicate Lineup"
            >
                <Form id="duplicate-lineup-form" METHOD="POST" followPath={`/e/ensembles/${ensemble.id}/lineup/$slug$`} >
                    <Text id="lineup-name" name="name" label="Lineup Name" isRequired />
                </Form>
                <section className="modal-buttons">
                    <button name="submit" className="fit" form="duplicate-lineup-form">Duplicate</button>
                </section>
            </ModalButton>
        ],
    }
        
    return (
        <SecurityWrapper currentModule="ensembles">
            <div id="page-base" >
                <div id="nav-header">
                    <SubNav caption="ensembles" root="ensembles" navNodes={navNodes} buttons={buttons} />
                </div>
                <div id="page-frame">
                    {context.children}
                </div>
            </div>
        </SecurityWrapper>
    )

}