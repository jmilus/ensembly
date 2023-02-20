import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import {fetchManyMembers} from '../api/members/getManyMembers';

import Meta from '../../components/Meta';
import MemberCard from '../../components/MemberCard';

import V from '../../components/Vcontrols/VerdantControl';

import { GlobalContext } from "../_app";

import basePageStyles from '../../styles/basePage.module.css';

export async function getServerSideProps(context) {
    const members = await fetchManyMembers()

    return {
        props: {
            members
        }
    }
}

export default function MembersPage(initialProps) {
    const { dispatch } = useContext(GlobalContext);
    const [members, setMembers] = useState(initialProps.members)
    const [searchString, setSearchString] = useState("");
    const router = useRouter();

    useLoader("all-members", setMembers, `/api/members/getManyMembers`);
    
    const newMemberModal = () => {
        const submitModal = (newRecord) => {
            console.log("follow up data:", newRecord)
            dispatch({
                type: "modal",
                payload: {
                    type: "hide"
                }
            })
            router.push(`/members/${newRecord.id}`)
        }

        const modalBody = 
            <V.Form id="new-member-modal-form" APIURL="/members/createMember" debug >
                <section className="modal-fields">
                    <V.Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                    <V.Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
                </section>
                <section className="modal-buttons">
                    <button name="submit">Submit</button>
                    <button name="cancel">Cancel</button>
                </section>
            </V.Form>

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
            <section className="modal-fields">
                <V.File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
            </section>
        
        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Upload Members from Excel File",
                    body: modalBody,
                    URL: "/members/uploadMembers",
                    file: true
                },
                buttons: [
                    { name: "submit", caption: "Upload Members", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
    }

    const filteredMembers = members.filter(member => {
        return member.aka.toLowerCase().includes(searchString.toLowerCase());
    })

    let membersGrid = null;
    if (members) {
        console.log({ filteredMembers });
        membersGrid = filteredMembers.map((member, i) => {
            return (
                <MemberCard
                    key={i}
                    membership={{member}}
                    presentation={"grid"}
                    format={"detail"}
                />
            )
        })
    }

    return (
        <>
            <Meta title={"Ensembly | Members"} />
            <div className={basePageStyles.pageBase}>
                <div className={basePageStyles.formSection}>
                    <div className={basePageStyles.pageHeader}>
                        <h1>Members</h1>
                        <input className="uncontrolled-text" type="text" placeholder="Search..." onChange={(e) => setSearchString(e.target.value)} />
                    </div>
                    <div className={basePageStyles.pageDetails}>
                        <div className="grid">
                            { membersGrid }
                        </div>
                    </div>
                </div>
                <div className={basePageStyles.actionSection}>
                    <button className="icon-and-label" onClick={newMemberModal}><i>person_add</i>New Member</button>
                    <button className="icon-and-label" onClick={uploadMembersModal}><i>upload</i>Upload Members</button>
                </div>
            </div>
        </>
    )
}