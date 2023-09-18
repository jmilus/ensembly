import 'server-only';

import SecurityWrapper from 'components/SecurityWrapper';
import ModalButton from 'components/ModalButton';
import { Form, File } from 'components/Vcontrols';
import SubNav from 'components/SubNav';

import { getOneEnsemble } from '@/api/ensembles/[id]/route';

export default async function EnsembleRecordLayout(context) {
    const ensemble = await getOneEnsemble(context.params.id)
    const navNodes = [
        { caption: "General", route: `/${ensemble.id}/general` },
        { caption: "Schedule", route: `/${ensemble.id}/schedule` },
        { caption: "Lineup", route: `/${ensemble.id}/lineup/x` }
    ]

    const buttons = [
        <ModalButton
            key="x"
            modalButton={<><i>upload</i><span>Upload Members</span></>}
            buttonClass="fit"
            title="Upload Members From Excel File"
        >
            <Form id="upload-members-form" APIURL="/api/members/uploadMembers" METHOD="POST" auxData={{ensembleId: ensemble.id}} debug>
                <section className="modal-fields">
                    <File id="fileUpload" name="members" handling="upload" fileTypes={[".xlsx"]} />
                </section>
            </Form>
            <section className="modal-buttons">
                <button name="submit" form="upload-members-form">Submit</button>
            </section>
        </ModalButton>
    ]
        
    return (
        <SecurityWrapper currentModule="ensembles">
            <div className="page-base" >
                <div className="action-section">
                    <SubNav caption= "ensembles" root="ensembles" navNodes={navNodes} buttons={buttons} />
                </div>
                <div className="form-section">
                    {context.children}
                </div>
            </div>
        </SecurityWrapper>
    )

}