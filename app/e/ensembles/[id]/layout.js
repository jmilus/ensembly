import 'server-only';

import SecurityWrapper from 'components/SecurityWrapper';
import ModalButton from 'components/ModalButton';
import { Form, File, Text, Select } from 'components/Vcontrols';
import SubNav from 'components/SubNav';

import { getOneEnsemble } from '@/api/ensembles/[id]/route';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

export default async function EnsembleRecordLayout(context) {
    const ensemble = await getOneEnsemble(context.params.id)
    const capacities = await getAllMembershipCapacities();
    const navNodes = [
        { caption: "General", route: `/e/ensembles/${ensemble.id}/general` },
        { caption: "Schedule", route: `/e/ensembles/${ensemble.id}/schedule` },
        { caption: "Lineup", route: `/e/ensembles/${ensemble.id}/lineup` },
        { caption: "Settings", route: `/e/ensembles/${ensemble.id}/settings` }
    ]

    const buttons = {
        general: [
            <ModalButton
                modalButton={<><i>upload</i><span>Upload Members</span></>}
                buttonClass="fit"
                title="Upload Members From Excel File"
            >
                <Form id="upload-members-form" APIURL="/api/members/uploadMembers" METHOD="POST" auxData={{ensembleId: ensemble.id}}>
                    <File id="fileUpload" name="members" handling="upload" fileTypes="xlsx" isRequired />
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="upload-members-form">Submit</button>
                </section>
            </ModalButton>
        ],
        settings: [
            <ModalButton
                modalButton={<><i>library_add</i><span>Create New Division</span></>}
                buttonClass="fit"
                title="Create Root-Level Division"
            >
                <Form id="create-root-division-form" APIURL={`/api/ensembles/${ensemble.id}/division/create-division`} METHOD="POST">
                    <section className="inputs">
                        <Text id="division-name" name="name" label="Division Name" isRequired />
                        <Text id="division-taxonomy" name="taxonomy" label="Taxonomy" />
                        <Select id="division-capacity" name="capacity" label="Capacity" options={capacities} isRequired />
                    </section>
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="create-root-division-form">Create</button>
                </section>
            </ModalButton>
        ]
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