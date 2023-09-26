import SubNav from 'components/SubNav';

import ModalButton from 'components/ModalButton';
import { Form, Text, File } from 'components/Vcontrols';

export default function ModuleSubNav() {
    const navButtons = [
        <ModalButton
            key="modal-button-new-member"
            modalButton={<><i>person_add</i><span>New Member</span></>}
            title="Create New Member"
            buttonClass="fit"
        >
            <Form id="new-member-modal-form" METHOD="POST" followPath="$slug$" >
                <section className="modal-fields inputs">
                    <Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                    <Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
                </section>
            </Form>
            <section className="modal-buttons">
                <button name="submit" form="new-member-modal-form">Create Member</button>
            </section>
        </ModalButton>,
        <ModalButton
            key="modal-button-upload-members"
            modalButton={<><i>upload</i><span>Upload Members</span></>}
            title="Upload Members from Excel File"
            buttonClass="fit"
        >
            <Form id="upload-members-modal-form" debug>
                <section className="modal-fields">
                    <File id="fileUpload" field="file" handling="upload" fileType="xlsx" isRequired />
                </section>
            </Form>
            <section className="modal-buttons">
                <button name="submit" form="upload-members-modal-form">Upload</button>
            </section>
        </ModalButton>
    ]

    return <SubNav root="members" buttons={navButtons} />
}