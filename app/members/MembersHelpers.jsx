'use client'

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'

import {Form, Text} from '../../components/Vcontrols';

import { GlobalContext } from "../../components/ContextFrame";

export function MemberNav() {
    const { dispatch } = useContext(GlobalContext);
    const router = useRouter();

    const newMemberModal = () => {
        const submitModal = (newRecord) => {
            console.log("follow up data:", newRecord)
            dispatch({
                route: "modal",
                payload: {
                    type: "hide"
                }
            })
            router.push(`/members/${newRecord.id}`)
        }

        const modalBody = 
            <Form id="new-member-modal-form" APIURL="/members/createMember" followUp={submitModal} debug >
                <section className="modal-fields">
                    <Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                    <Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
                </section>
                <section className="modal-buttons">
                    <button name="submit">Create Member</button>
                    <button name="cancel">Cancel</button>
                </section>
            </Form>

        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Member",
                    body: modalBody,
                }
            }
        })
    }

    const uploadMembersModal = () => {
        const submitModal = (submission) => {
            console.log({submission});
        }

        const modalBody = 
            <Form id="upload-members-modal-form" >
                <section className="modal-fields">
                    <File id="fileUpload" field="file" handling="upload" fileType="xlsx" followUp={submitModal} />
                </section>
                <section className="modal-buttons">
                    <button name="submit">Upload</button>
                    <button name="cancel">Cancel</button>
                </section>
            </Form>
        
        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Upload Members from Excel File",
                    body: modalBody
                }
            }
        })
    }

    return (
        <article style={{padding: "10px"}}>
            <h1>Members</h1>
            <button className="icon-and-label" onClick={newMemberModal}><i>person_add</i>New Member</button>
            <button className="icon-and-label" onClick={uploadMembersModal}><i>upload</i>Upload Members</button>
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