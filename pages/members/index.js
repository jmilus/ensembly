import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import getAllMembers from '../../lib/members/_fetchAllMembers';

import Meta from '../../components/Meta';
import MemberCard from '../../components/MemberCard';

import V from '../../components/ControlMaster';

import { GlobalContext } from "../_app";

import basePageStyles from '../../styles/basePage.module.css';

export async function getServerSideProps(context) {
    const members = await getAllMembers()

    return {
        props: {
            members
        }
    }
}

export default function membersPage(initialProps) {
    const { dispatch } = useContext(GlobalContext);
    const [members, setMembers] = useState(initialProps.members)
    const router = useRouter();

    useLoader("all-members", setMembers, `/api/members/fetchAllMembers`);
    
    const newMemberModal = () => {
        const submitModal = (newRecord) => {
            router.push(`/members/${newRecord[0].id}`)
        }

        const modalBody = 
            <section className="modal-fields">
                <V.Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                <V.Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
            </section>

        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Member",
                    body: modalBody,
                    URL: "/members/createNewMember"
                },
                buttons: [
                    { name: "submit", caption: "Create Member", style: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
    }

    let membersGrid = null;
    if (members) {
        // console.log({ members });
        membersGrid = members.map((member, i) => {
            return (
                <MemberCard
                    key={i}
                    member={member}
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
                    </div>
                    <div className={basePageStyles.pageDetails}>
                        <div className="grid">
                            { membersGrid }
                        </div>
                    </div>
                </div>
                <div className={basePageStyles.actionSection}>
                    <input type="text" placeholder="Search..." />
                    <button className="icon-and-label" onClick={newMemberModal}>New Member</button>
                </div>
            </div>
        </>
    )
}