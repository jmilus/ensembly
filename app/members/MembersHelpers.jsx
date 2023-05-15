'use client'

import Link from 'next/link'

import {Form, Text, File} from '../../components/Vcontrols';

import Modal2 from '../../components/Modal2';

export function MemberNav() {

    return (
        <article style={{padding: "10px"}}>
            <h1>Members</h1>
            <Modal2
                modalButton={<button><i>person_add</i><span>New Member</span></button>}
                title="Create New Member"
            >
                <Form id="new-member-modal-form" APIURL="/members/createMember" debug >
                    <section className="modal-fields">
                        <Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                        <Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
                    </section>
                    <section className="modal-buttons">
                        <button name="submit">Create Member</button>
                        <button name="cancel">Cancel</button>
                    </section>
                </Form>
            </Modal2>
            <Modal2
                modalButton={<button><i>upload</i><span>Upload Members</span></button>}
                title="Upload Members from Excel File"
            >
                <Form id="upload-members-modal-form" APIURL="/members/uploadMembers" debug>
                    <section className="modal-fields">
                        <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                    </section>
                    <section className="modal-buttons">
                        <button name="submit">Upload</button>
                        <button name="cancel">Cancel</button>
                    </section>
                </Form>
            </Modal2>
        </article>
    )

}

export function MemberProfileNav({ member }) {

    return (
        <article style={{ padding: "10px" }}>
            <Link href="/members"><i>arrow_back</i>All Members</Link>
            <h1>{member.aka}</h1>
        </article>
    )

}