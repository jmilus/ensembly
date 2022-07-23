import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';

import Meta from '../../components/Meta';
import MemberCard from '../../components/MemberCard';

import { ACTION_TYPES, GlobalContext } from "../_app";

import style from '../../styles/members.module.css';

export default function membersPage(props) {
    const { dispatch, state } = useContext(GlobalContext);
    const { members } = state;
    const router = useRouter();

    useEffect(() => {
        async function fetchMembers() {
            const response = await fetch('/api/members/fetchAllMembers');
            if (!response.ok) throw new Error(response.statusText);
            const memberList = await response.json()
            try {
                dispatch({
                    type: ACTION_TYPES.SET_MEMBERLIST,
                    payload: {
                        members: memberList
                    }
                })
            }
            catch (error) {
                //set error
                console.log("this is the error", { error })
            }
        }
        fetchMembers();
    }, []);

    const createMember = async (formData) => {
        
        dispatch({
            type: ACTION_TYPES.LOAD_MODAL
        })
        try {
            const newMember = await fetch('/api/members/createNewMember', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(member => {
                return member;
            })
            .catch((err) => {
                console.error('Could not create new member...', err);
            })
            if (newMember.err) throw new Error(newMember.message);

            dispatch({
                type: ACTION_TYPES.HIDE_MODAL
            })

            console.log({ newMember });

            members.push(newMember);
            dispatch({
                type: ACTION_TYPES.SET_MEMBERLIST,
                payload: {
                    members: members
                }
            })

            router.push(`/members/${newMember.id}`)
        }
        catch (error) {
            dispatch({
                type: ACTION_TYPES.SET_MODAL,
                payload: {
                    modal: {
                        type: "error",
                        message: error.message
                    }
                }
            })
            console.error({ error });
        }

    }
    
    const newMemberModal = () => {
        console.log("create new member");

        const modalContent = {
            type: "form",
            submit: createMember,
            title: "Create New Member",
            fields: [
                { id: "firstName", type: "text", label: "First Name", controlType: "text"},
                { id: "lastName", type: "text", label: "Last Name", controlType: "text"}
            ],
            actions: []
        }
        dispatch({
            type: ACTION_TYPES.SET_MODAL,
            payload: {
                modal: modalContent
            }
        })
    }

    let membersGrid = null;
    if (members) {
        console.log({ members });
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
            <div className="module-page">
                <div className="page-header">
                    <div className="page-controls">
                        <input type="text" placeholder="Search..." />
                        <button className="icon-and-label" onClick={() => newMemberModal()}>Add</button>
                    </div>
                </div>
                <div className="page-body">
                    <div className={style.cardGrid}>
                        {
                            membersGrid
                        }
                    </div>
                </div>
            </div>
        </>
    )
}