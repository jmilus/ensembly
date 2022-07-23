import { useEffect, useState, useContext, useRef } from 'react';
import useAutoSaveForm from '../../hooks/useAutoSaveForm';
import { useRouter } from 'next/router';

import ProfilePhoto from '../../components/ProfilePhoto';
import Carousel from '../../components/Carousel';
import ContactCard from '../../components/ContactCard';
import EnsembleCard from '../../components/EnsembleCard';
import DateControl from '../../components/DateControl';
import Link from 'next/link';
import SelectControl from '../../components/SelectControl';
import TextControl from '../../components/TextControl';

import { ACTION_TYPES, GlobalContext } from "../_app";
import { deleteRecord, handleFormUpdate } from '../../utils/';
import getAllMembers from '../../lib/members/_fetchAllMembers';
import getThisMember from '../../lib/members/_fetchThisMember';
import { Race, Sex, HairColor, EyeColor, EmailRank, AddressRank, PhoneRank, Role } from '@prisma/client';

import styles from '../../styles/memberProfile.module.css';
import { isEmpty } from 'lodash';

export async function getStaticProps({ params }) {
    const member = await getThisMember(params.id);
    return {
        props: {
            member: member ? member : {}
        }
    }
}

export async function getStaticPaths() {
    const members = await getAllMembers();
    const paths = members.map((member) => {
        return {
            params: {
                id: member.id.toString(),
            }
        }
    })
    return {
        paths,
        fallback: true
    }
}

const memberProfile = (initialProps) => {
    const router = useRouter();
    const [member, setMember] = useState(initialProps.member);
    const [saved, setSaved] = useState(true);
    const saveTimer = useRef(null);

    const { autoSaveDelay } = useAutoSaveForm();

    const id = router.query.id;

    const {
        dispatch,
        state: { members }
    } = useContext(GlobalContext);

    const loadMemberProfile = async (member) => {
        const response = await fetch(`/api/members/fetchThisMember?id=${member.id}`);
        if (!response.ok) throw new Error(response.statusText);
        const profile = await response.json();
        console.log("loaded member:",{profile});
        setMember(profile.member);
    }

    useEffect(() => {
        if (isEmpty(initialProps.member)) {
            if (members.length > 0) {
                const findMemberById = members.find(member => {
                    return member.id.toString() === id;
                })
                loadMemberProfile(findMemberById);
            }
        }

    }, [id]);

    const updateMemberProfile = async (event) => {
        const APIURL = '/api/members/updateThisMember';
        const ids = { recordId: member.id, linkedId: null };
        try {
            await handleFormUpdate(event, APIURL, ids)
        }
        catch {
            console.log("there was a problem saving:")
        }
        loadMemberProfile(member);
    }

    const updateMemberEmails = async (event, emailId) => {
        console.log({ event }, { emailId });
        const APIURL = '/api/members/updateThisEmail';
        const ids = { recordId: emailId, linkedId: member.id };

        try {
            await handleFormUpdate(event, APIURL, ids);
        }
        catch {
            console.log("unable to add email.");
        }
        loadMemberProfile(member);
    }

    const deleteMemberEmail = async (emailId) => {
        const APIURL = '/api/members/deleteThisEmail';

        try {
            await deleteRecord(APIURL, emailId);
        }
        catch {
            console.log("unable to delete email.")
        }
        loadMemberProfile(member);
    }

    const updateMemberPhone = async (event, phoneId) => {
        const APIURL = '/api/members/updateThisPhoneNumber';
        const ids = { recordId: phoneId, linkedId: member.id };

        try {
            await handleFormUpdate(event, APIURL, ids);
        }
        catch {
            console.log("unable to add phone number.");
        }
        loadMemberProfile(member);
    }

    const deleteMemberPhone = async (phoneId) => {
        const APIURL = '/api/members/deleteThisPhoneNumber';
        try {
            await deleteRecord(APIURL, phoneId);
        }
        catch {
            console.log("unable to delete phone number.")
        }
        loadMemberProfile(member);
    }

    const updateMemberAddress = async (event, addressId) => {
        const APIURL = '/api/members/updateThisAddress';
        const ids = { recordId: addressId, linkedId: member.id };
        try {
            await handleFormUpdate(event, APIURL, ids);
        }
        catch {
            console.log("unable to update address.")
        }
        loadMemberProfile(member);
    }

    const deleteMemberAddress = async (addressId) => {
        const APIURL = '/api/members/deleteThisAddress';
        try {
            await deleteRecord(APIURL, addressId);
        }
        catch {
            console.log("unable to delete address.")
        }
        loadMemberProfile(member);
    }

    const updateMembership = async (formData, membershipRecord) => {
        console.log("membership!", formData);
        dispatch({
            type: ACTION_TYPES.LOAD_MODAL
        })
        await fetch(`/api/members/updateMembership`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: membershipRecord,
                memberId: member.id,
                ensembleId: formData.id
            })
        })
            .then(res => res.json())
            .then(response => {
                console.log(response)
                loadMemberProfile(member);
            })
            .catch((err) => {
                console.log("Could not update membership...", err);
            })
        
        
        dispatch({
            type: ACTION_TYPES.HIDE_MODAL
        })
    }

    const newMembershipModal = async () => {
        console.log("membership modal");
        const response = await fetch('/api/ensembles/fetchAllEnsembles');
        if (!response.ok) throw new Error(response.statusText);
        const ensembleList = await response.json()
        console.log({ensembleList})
        try {
            dispatch({
                type: ACTION_TYPES.SET_ENSEMBLELIST,
                payload: {
                    ensembles: ensembleList
                }
            })
        }
        catch (error) {
            //set error
            console.log("this is the error", { error })
        }

        const modalContent = {
            type: "form",
            submit: updateMembership,
            title: "Add Member To...",
            fields: [
                { id: "ensembleName", name: "ensembleId", type: "select", label: "Ensemble", controlType: "select", options: ensembleList },
                { id: "ensembleRole", name: "role", type: "select", label: "Role", controlType: "select", options: Role }
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

    const { firstName, middleName, lastName, name, memberBio, ensembles, phoneNumbers, addresses, emails } = member;

    console.log("rendering with", member);
    
    let pageContent = null;
    if (member) {
        pageContent =
            <div className={styles.profilePage}>
                <div className={styles.dataSection}>
                    <div className={styles.profileHeader}>
                        <form id="memberName" name="memberName" onSubmit={(e) => updateMemberProfile(e)} onChange={(e) => autoSaveDelay(e)}>
                            <TextControl id="name" name="name" type="text" initialValue={name} hero isRequired />
                        </form>
                    </div>
                    <div className={styles.profileDetails}>
                        <div id="member-bio" className="profile-segment">
                            <ProfilePhoto
                                name={lastName}
                                profilePic=""
                                // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                                styling={{ width: "100px", height: "100px" }}
                            />
                            <form id="profile" name="profile" onSubmit={(e) => updateMemberProfile(e)} onChange={(e) => autoSaveDelay(e)}>
                                <fieldset>
                                    <legend>Bio</legend>
                                    <section>
                                        <TextControl id="firstName" name="firstName" type="text" label="First Name" initialValue={firstName} />
                                        <TextControl id="middleName" name="middleName" type="text" label="Middle Name" initialValue={middleName} />
                                        <TextControl id="lastName" name="lastName" type="text" label="Last Name" initialValue={lastName} />
                                    </section>
                                    <section>
                                        <DateControl id="birthday" name="birthday" label="Birthday" initialValue={memberBio?.birthday} />
                                        <SelectControl id="sex" name="sex" label="Sex" initialValueId={memberBio?.sex} options={Sex} />
                                    </section>

                                    <section>
                                        <TextControl id="height" name="height" type="number" label="Height" initialValue={memberBio?.height} units="imperial-length" />
                                        <TextControl id="weight" name="weight" type="number" label="Weight" initialValue={memberBio?.weight} units="imperial-weight" />
                                    </section>
                                    <section>
                                        <SelectControl id="race" name="race" label="Race" initialValueId={memberBio?.race} options={Race} />
                                        <TextControl id="ethnicity" name="ethnicity" type="text" label="Ethnicity" initialValue={memberBio?.ethnicity} />
                                    </section>
                                    <section>
                                        <SelectControl id="hair" name="hair" label="Hair" initialValueId={memberBio?.hair} options={HairColor} />
                                        <SelectControl id="eyes" name="eyes" label="Eyes" initialValueId={memberBio?.eyes} options={EyeColor} />
                                    </section>
                                </fieldset>
                            </form>
                        </div>
                        <div id="member-contacts" className="profile-segment">
                            <Carousel
                                id="carousel-email"
                                title="Email"
                                newItem={<ContactCard type="email" enums={EmailRank} formSubmit={updateMemberEmails} />}
                            >
                                {
                                    emails.map((email, i) => {
                                        return (
                                            <ContactCard
                                                key={i}
                                                id={`email-${i}`}
                                                type="email"
                                                name={`email-${i}`}
                                                recordId={email.id}
                                                contact={email}
                                                enums={EmailRank}
                                                formSubmit={updateMemberEmails}
                                                deleteMe={deleteMemberEmail}
                                            />
                                        )
                                    })
                                }
                            </Carousel>
                            <Carousel
                                id="carousel-phone"
                                title="Phone"
                                newItem={<ContactCard type="phone" enums={PhoneRank} formSubmit={updateMemberPhone} />}
                            >
                                {
                                    phoneNumbers.map((phone, i) => {
                                        return (
                                            <ContactCard
                                                key={i}
                                                id={`phone-${i}`}
                                                type="phone"
                                                name={`phone-${i}`}
                                                recordId={phone.id}
                                                contact={phone}
                                                enums={PhoneRank}
                                                formSubmit={updateMemberPhone}
                                                deleteMe={deleteMemberPhone}
                                            />
                                        )
                                    })
                                }
                            </Carousel>
                            <Carousel
                                id="carousel-address"
                                title="Address"
                                newItem={<ContactCard type="address" enums={AddressRank} formSubmit={updateMemberAddress} />}
                            >
                                {
                                    addresses.map((address, i) => {
                                        return (
                                            <ContactCard
                                                key={i}
                                                id={`address-${i}`}
                                                type="address"
                                                name={`address-${i}`}
                                                recordId={address.id}
                                                contact={address}
                                                enums={AddressRank}
                                                formSubmit={updateMemberAddress}
                                                deleteMe={deleteMemberAddress}
                                            />
                                        )
                                    })
                                }
                            </Carousel>
                        </div>
                        <div id="memberships" className="profile-segment">
                            <fieldset className="button-stack">
                                <legend>Membership</legend>
                                <div id="ensemble-membership-list">
                                    {
                                        Object.keys(ensembles).map((key, i) => {
                                            const ensemble = ensembles[key];
                                            return (
                                                <EnsembleCard
                                                    key={i}
                                                    ensemble={ensemble}
                                                    memberId={member.id}
                                                    presentation="list"
                                                    format="detail"
                                                //sections={initialProps.sections}
                                                />
                                            )
                                        })
                                    }
                                </div>
                                <button id="add-membership" onClick={() => newMembershipModal()}>Add Membership</button>
                            </fieldset>
                        </div>
                    </div>
                </div>
                <div className={styles.actionSection}>
                    <Link href="/members"><button className="icon-and-label"><i>arrow_back</i>Back to Members</button></Link>
                    <button type="submit" className="icon-and-label" onClick={() => document.forms["profile"].requestSubmit()}><i>save</i>Save</button>
                </div>
            </div>
    }

    return pageContent;
}

export default memberProfile;