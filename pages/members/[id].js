import { useEffect, useState, useContext, useRef } from 'react';
import { useImmer } from 'use-immer';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import Link from 'next/link';
import ProfilePhoto from '../../components/ProfilePhoto';
import EnsembleCard from '../../components/EnsembleCard';
import Meta from '../../components/Meta';

import VForm from '../../components/VForm';
import V from '../../components/ControlMaster';

import { GlobalContext } from "../_app";

import {fetchOneMember} from '../api/members/getOneMember';
import { Race, Sex, HairColor, EyeColor, EmailRank, AddressRank, PhoneRank, Capacity } from '@prisma/client';

import basePageStyles from '../../styles/basePage.module.css';

export async function getServerSideProps(context) {
    const member = await fetchOneMember(context.params.id);
    return {
        props: {
            member,
        }
    }
}

const MemberProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);

    const [member, updateMember] = useImmer(initialProps.member);
    const router = useRouter();

    console.log("member:", {initialProps}, { member });
    
    useLoader(member.id, updateMember, `/api/members/getOneMember?id=${member.id}`);

    const newMembershipModal = async () => {
        const response = await fetch('/api/ensembles/getManyEnsembles');
        if (!response.ok) throw new Error(response.statusText);
        const ensembleList = await response.json()

        const updateMembershipPanel = (data) => {
            console.log({ data });
            const newMembership = data[0];
            const newCapacity = {
                membershipId: newMembership.id,
                startDate: newMembership.startDate,
                endDate: newMembership.endDate,
                status: newMembership.status,
                name: newMembership.capacity,
                title: newMembership.title,
                division: newMembership.division,
                subDivision: newMembership.subDivision
            }
            const updatedEnsembles = { ...member.ensembles };
            if (!updatedEnsembles[newMembership.ensembleId]) updatedEnsembles[newMembership.ensembleId] = {
                id: newMembership.ensembleId,
                name: newMembership.ensemble.name,
                capacities: [],
                type: newMembership.ensemble.type
            };
            updatedEnsembles[newMembership.ensembleId].capacities.push(newCapacity)
            updateMember({...member, ensembles: updatedEnsembles})
        }

        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Add Member To...",
                    body: <V.Select id="ensembleName" field="ensembleId" label="Ensemble" options={ensembleList} />,
                    URL: "/members/updateMembership",
                    additionalIds: { memberId: member.id }
                },
                buttons: [
                    { name: "submit", caption: "Add", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: updateMembershipPanel
            }
        })
    }

    const localUpdateEmail = (email) => {
        updateMember(draft => {
            draft.emails[0] = email;
        })
    }
    const localUpdatePhone = (phone) => {
        updateMember(draft => {
            draft.phoneNumbers[0] = phone;
        })
    }
    const localUpdateAddress = (address) => {
        updateMember(draft => {
            draft.addresses[0] = address;
        })
    }

    let emailAddress = member.emails?.length > 0 ? member.emails[0] : "";
    let phoneNumber = member.phoneNumbers?.length > 0 ? member.phoneNumbers[0] : "";
    let mailingAddress = member.addresses?.length > 0 ? member.addresses[0] : "";

    if (!member) return <div className="floater">Member Not Found</div>
    
    const ensembleCards = member.memberships.map((membership, i) => {
        return (
            <EnsembleCard
                key={i}
                membership={membership}
                ensemble={membership.ensemble}
                presentation="list"
                format="membership"
            />
        )
    })

    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <VForm id="memberName" APIURL="/members/updateMember" recordId={member.id}>
                        <V.Text id="aka" field="aka" value={member.aka} hero isRequired />
                    </VForm>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <article className="padded">
                        <div id="member-photo" className={basePageStyles.profileSegment}>
                            <ProfilePhoto
                                field={member.lastName}
                                profilePic=""
                                // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                            />
                        </div>
                        <div id="member-bio" className={basePageStyles.profileSegment}>
                            <VForm id="member-profile" APIURL="/members/updateMember" recordId={member.id} >
                                <fieldset>
                                    <legend>Bio</legend>
                                    <section>
                                        <V.Text id="firstName" field="firstName" label="First Name" value={member.firstName} isRequired />
                                        <V.Text id="middleName" field="middleName" label="Middle Name" value={member.middleName} />
                                        <V.Text id="lastName" field="lastName" label="Last Name" value={member.lastName} isRequired />
                                    </section>
                                    <section>
                                        <V.Select id="sex" field="sex" label="Sex" value={member.memberBio?.sex} options={Sex} />
                                        <V.Date id="birthday" field="birthday" label="Birthday" value={member.memberBio?.birthday} />
                                    </section>
                                    <section>
                                        <V.Select id="hair" field="hair" label="Hair Color" value={member.memberBio?.hair} options={HairColor} />
                                        <V.Select id="eyes" field="eyes" label="Eye Color" value={member.memberBio?.eyes} options={EyeColor} />
                                        <V.Number id="height" field="height" label="Height" format="height" value={member.memberBio?.height} />
                                        <V.Number id="weight" field="weight" label="Weight" format="weight" value={member.memberBio?.weight} />
                                    </section>
                                    <section>
                                        <V.Select id="race" field="race" label="Race" value={member.memberBio?.race} options={Race} />
                                        <V.Text id="ethnicity" field="ethnicity" label="Ethnicity" value={member.memberBio?.ethnicity} />
                                    </section>
                                </fieldset>
                            </VForm>
                        </div>
                    </article>
                        
                    <article className="padded">
                        <div id="member-contacts" className={basePageStyles.profileSegment}>
                            <fieldset>
                                <legend>Contact Info</legend>
                                <section>
                                    <VForm id="member_email" APIURL="/members/updateEmail" additionalIds={{memberId: member.id}} followUp={localUpdateEmail} >
                                        <V.Text id="email" field="email" label="Email" value={emailAddress?.email} recordId={emailAddress?.id} />
                                    </VForm>
                                    <VForm id="member_phone" APIURL="/members/updatePhoneNumber" additionalIds={{memberId: member.id}} followUp={localUpdatePhone} >
                                        <V.Text id="phone" field="phonenumber" label="Phone Number" format="phone" value={phoneNumber?.phonenumber} recordId={phoneNumber?.id} />
                                    </VForm>
                                </section>
                                <VForm id="address" APIURL="/general/updateAddress" additionalIds={{memberId: member.id}}  recordId={mailingAddress?.id} followUp={localUpdateAddress} >
                                    <V.Text id="street1" field="street" label="Street" value={mailingAddress?.street} />
                                    <V.Text id="street2" field="street2" label="Street 2" value={mailingAddress?.street2} />
                                    <section>
                                        <V.Text id="city" field="city" label="City" value={mailingAddress?.city} Vstyle={{ flex: 4 }} />
                                        <V.Text id="state" field="state" label="State" value={mailingAddress?.state} />
                                        <V.Text id="postalCode" field="postalCode" label="Zip Code" value={mailingAddress?.postalCode} Vstyle={{ flex: 2 }}/>
                                    </section>
                                </VForm>
                            </fieldset>
                            
                        </div>
                    </article>

                    <article className="padded">
                        <div id="memberships" className={basePageStyles.profileSegment} style={{gridRowStart:"span 2"}}>
                            <fieldset className="button-stack">
                                <legend>Membership</legend>
                                <div id="ensemble-membership-list">
                                    { ensembleCards }
                                </div>
                                <button id="add-membership" onClick={() => newMembershipModal()}>Add Membership</button>
                            </fieldset>
                        </div>
                    </article>
                    
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <Link href="/members"><button className="icon-and-label"><i>arrow_back</i>Back to Members</button></Link>
            </div>
        </div>
    )

}

export default MemberProfile;