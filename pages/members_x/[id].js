import { useEffect, useState, useContext, useRef } from 'react';
import { useImmer } from 'use-immer';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import Link from 'next/link';
import ProfilePhoto from '../../components/ProfilePhoto';
import EnsembleCard from '../../components/EnsembleCard';

import V from '../../components/Vcontrols/VerdantControl';

import { GlobalContext } from '../../components/ContextFrame';

import {fetchOneMember} from '../api/members/getOneMember';
import { Race, Sex, HairColor, EyeColor, EmailRank, AddressRank, PhoneRank, Capacity } from '@prisma/client';
import { useUser } from '@supabase/auth-helpers-react';

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
    const user = useUser();

    console.log({user})

    const [member, updateMember] = useImmer(initialProps.member);
    const router = useRouter();

    console.log("member:", {initialProps}, { member });
    
    useLoader(member.id, updateMember, `/api/members/getOneMember?id=${member.id}`);

    const newMembershipModal = async () => {
        const response = await fetch('/api/ensembles/getManyEnsembles');
        if (!response.ok) throw new Error(response.statusText);
        const ensembleList = await response.json()

        const updateMembershipPanel = (data) => {
            dispatch({
                type: "modal",
                payload: {
                    type: "hide"
                }
            })
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

        const modalBody = 
            <V.Form id="add-membership-form" APIURL="/members/updateMembership" additionalIds={{ memberId: member.id }} followUp={updateMembershipPanel}>
                <V.Select id="ensembleName" name="ensembleId" label="Ensemble" options={ensembleList} />
                <section className="modal-buttons">
                    <button name="submmit">Submit</button>
                    <button name="cancel">Cancel</button>
                </section>
            </V.Form>

        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Add Member To...",
                    body: modalBody
                }
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
        console.log({address})
        // updateMember(draft => {
        //     draft.addresses[0] = address;
        // })
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
                    <V.Form id="memberName" APIURL="/members/updateMember" recordId={member.id} auto>
                        <V.Text id="aka" name="aka" value={member.aka} hero isRequired />
                    </V.Form>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <article className="padded">
                        <div id="member-photo" className={basePageStyles.profileSegment}>
                            <ProfilePhoto
                                name={member.lastName}
                                profilePic=""
                                // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                            />
                        </div>
                        <div id="member-bio" className={basePageStyles.profileSegment}>
                            <V.Form id="member-profile" APIURL="/members/updateMember" recordId={member.id} auto debug >
                                <fieldset>
                                    <legend>Bio</legend>
                                    <section>
                                        <V.Text id="firstName" name="firstName" label="First Name" value={member.firstName} isRequired />
                                        <V.Text id="middleName" name="middleName" label="Middle Name" value={member.middleName} />
                                        <V.Text id="lastName" name="lastName" label="Last Name" value={member.lastName} isRequired />
                                    </section>
                                    <section>
                                        <V.Select id="sex" name="sex" label="Sex" value={member.memberBio?.sex} options={Sex} />
                                        <V.Select id="hair" name="hair" label="Hair Color" value={member.memberBio?.hair} options={HairColor} />
                                        <V.Select id="eyes" name="eyes" label="Eye Color" value={member.memberBio?.eyes} options={EyeColor} />
                                    </section>
                                    <section>
                                        <V.Date id="birthday" name="birthday" label="Birthday" value={member.memberBio?.birthday} />
                                        <V.Number id="height" name="height" label="Height" format="height" value={member.memberBio?.height} />
                                        <V.Number id="weight" name="weight" label="Weight" format="weight" value={member.memberBio?.weight} />
                                    </section>
                                    <section>
                                        <V.Select id="race" name="race" label="Race" value={member.memberBio?.race} options={Race} />
                                        <V.Text id="ethnicity" name="ethnicity" label="Ethnicity" value={member.memberBio?.ethnicity} />
                                    </section>
                                </fieldset>
                            </V.Form>
                        </div>
                    </article>
                        
                    <article className="padded">
                        <div id="member-contacts" className={basePageStyles.profileSegment}>
                            <fieldset>
                                <legend>Contact Info</legend>
                                <section>
                                    <V.Form id="member_email" APIURL="/members/updateEmail" additionalIds={{memberId: member.id}} followUp={localUpdateEmail} auto >
                                        <V.Text id="email" name="email" label="Email" value={emailAddress?.email} recordId={emailAddress?.id} />
                                    </V.Form>
                                    <V.Form id="member_phone" APIURL="/members/updatePhoneNumber" additionalIds={{memberId: member.id}} followUp={localUpdatePhone} auto >
                                        <V.Text id="phone" name="phonenumber" label="Phone Number" format="phone" value={phoneNumber?.phonenumber} recordId={phoneNumber?.id} />
                                    </V.Form>
                                </section>
                                <V.Form id="address" APIURL="/general/updateAddress" additionalIds={{ memberId: member.id }} recordId={mailingAddress?.id} followUp={localUpdateAddress} auto >
                                    <V.Text id="street1" name="street" label="Street" value={mailingAddress?.street} />
                                    <V.Text id="street2" name="street2" label="Street 2" value={mailingAddress?.street2} />
                                    <section>
                                        <V.Text id="city" name="city" label="City" value={mailingAddress?.city} Vstyle={{ flex: 4 }} />
                                        <V.Text id="state" name="state" label="State" value={mailingAddress?.state} />
                                        <V.Text id="postalCode" name="postalCode" label="Zip Code" value={mailingAddress?.postalCode} Vstyle={{ flex: 2 }}/>
                                    </section>
                                </V.Form>
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
                <button className="icon-and-label" onClick={() => router.push("/members")}><i>arrow_back</i>Back to Members</button>
            </div>
        </div>
    )

}

export default MemberProfile;