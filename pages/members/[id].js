import { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import Link from 'next/link';
import ProfilePhoto from '../../components/ProfilePhoto';
import EnsembleCard from '../../components/EnsembleCard';
import Meta from '../../components/Meta';


import VForm from '../../components/VForm';
import V from '../../components/ControlMaster';

import { GlobalContext } from "../_app";

import getThisMember from '../../lib/members/_fetchThisMember';
import getAllDivisions from '../../lib/ensembles/_fetchAllDivisions';
import getAllSubdivisions from '../../lib/ensembles/_fetchAllSubdivisions';
import { Race, Sex, HairColor, EyeColor, EmailRank, AddressRank, PhoneRank, Capacity } from '@prisma/client';

import basePageStyles from '../../styles/basePage.module.css';

export async function getServerSideProps(context) {
    const member = await getThisMember(context.params.id);
    const divisions = await getAllDivisions();
    const subdivisions = await getAllSubdivisions();
    return {
        props: {
            member,
            divisions,
            subdivisions,
        }
    }
}

const memberProfile = (initialProps) => {
    const {dispatch} = useContext(GlobalContext);

    const [member, setMember] = useState(initialProps.member);
    const router = useRouter();

    console.log("member:", {initialProps}, { member });
    
    useLoader(member.id, setMember, `/api/members/fetchThisMember?id=${member.id}`);

    const newMembershipModal = async () => {
        const response = await fetch('/api/ensembles/fetchAllEnsembles');
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
                division: newMembership.division,
                subDivision: newMembership.subDivision
            }
            const updatedEnsembles = { ...member.ensembles };
            updatedEnsembles[newMembership.ensembleId].capacities.push(newCapacity)
            setMember({...member, ensembles: updatedEnsembles})
        }
        
        const modalBody =
            <div className="modal-fields">
                <section>
                    <V.Select id="ensembleName" name="ensembleId" label="Ensemble" options={ensembleList} />
                </section>
                <section>
                    <V.Select id="ensembleCapacity" name="capacity" label="Capacity" options={Capacity} optionFilters={["capacity"]}>
                        <V.Select id="ensembleDivision" name="division" label="Division" options={initialProps.divisions} />
                    </V.Select>

                </section>
            </div>

        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Add Member To...",
                    body: modalBody,
                    URL: "/members/updateMembership",
                    linkedId: member.id
                },
                buttons: [
                    { name: "submit", caption: "Add", style: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: updateMembershipPanel
            }
        })
    }

    const emailAddress = member.emails?.length > 0 ? member.emails[0] : "";
    const phoneNumber = member.phoneNumbers?.length > 0 ? member.phoneNumbers[0] : "";
    const mailingAddress = member.addresses?.length > 0 ? member.addresses[0] : "";

    if (!member) return <div className="floater">Member Not Found</div>
    
    const ensembleCards = Object.keys(member.ensembles).map((key, i) => {
        const ensemble = member.ensembles[key];
        return (
            <EnsembleCard
                key={i}
                ensemble={ensemble}
                divisions={initialProps.divisions}
                subdivisions={initialProps.subdivisions}
                memberId={member.id}
                presentation="list"
                format="membership"
            />
        )
    })

    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <VForm id="memberName" APIURL="/members/updateThisMember" recordId={member.id}>
                        <V.Text id="name" name="name" value={member.name} hero isRequired />
                    </VForm>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <div className="grid profile">
                        <div id="member-photo" className={basePageStyles.profileSegment}>
                            <ProfilePhoto
                                name={member.lastName}
                                profilePic=""
                                // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                            />
                        </div>
                        <div id="member-bio" className={basePageStyles.profileSegment}>
                            <VForm id="member-profile" APIURL="/members/updateThisMember" recordId={member.id}>
                                <fieldset>
                                    <legend>Bio</legend>
                                    <section>
                                        <V.Text id="firstName" name="firstName" label="First Name" value={member.firstName} />
                                        <V.Text id="middleName" name="middleName" label="Middle Name" value={member.middleName} />
                                        <V.Text id="lastName" name="lastName" label="Last Name" value={member.lastName} />
                                    </section>
                                    <section>
                                        <V.Select id="sex" name="sex" label="Sex" value={member.memberBio?.sex} options={Sex} />
                                        <V.Date id="birthday" name="birthday" label="Birthday" value={member.memberBio?.birthday} />
                                    </section>
                                    <section>
                                        <V.Select id="hair" name="hair" label="Hair Color" value={member.memberBio?.hair} options={HairColor} />
                                        <V.Select id="eyes" name="eyes" label="Eye Color" value={member.memberBio?.eyes} options={EyeColor} />
                                        <V.Number id="height" name="height" label="Height" format="height" value={member.memberBio?.height} />
                                        <V.Number id="weight" name="weight" label="Weight" format="weight" value={member.memberBio?.weight} />
                                    </section>
                                    <section>
                                        <V.Select id="race" name="race" label="Race" value={member.memberBio?.race} options={Race} />
                                        <V.Text id="ethnicity" name="ethnicity" label="Ethnicity" value={member.memberBio?.ethnicity} />
                                    </section>
                                </fieldset>
                            </VForm>
                        </div>
                        

                        <div id="member-contacts" className={basePageStyles.profileSegment}>
                            <fieldset>
                                <legend>Contact Info</legend>
                                <section>
                                    <VForm id="member_email" APIURL="/members/updateThisEmail" linkedId={member.id}>
                                        <V.Text id="email" name="address" label="Email" value={emailAddress?.address} recordId={emailAddress?.id} />
                                    </VForm>
                                    <VForm id="member_phone" APIURL="/members/updateThisPhoneNumber" linkedId={member.id}>
                                        <V.Number id="phone" name="phonenumber" label="Phone Number" format="phone" value={phoneNumber?.phonenumber} recordId={phoneNumber?.id} />
                                    </VForm>
                                </section>
                                <VForm id="address" APIURL="/members/updateThisAddress" linkedId={member.id}  recordId={mailingAddress?.id}>
                                    <V.Text id="street1" name="street" label="Street" value={mailingAddress?.street} />
                                    <V.Text id="street2" name="street2" label="Street 2" value={mailingAddress?.street2} />
                                    <section>
                                        <V.Text id="city" name="city" label="City" value={mailingAddress?.city} inheritedStyles={{ flex: 5 }} />
                                        <V.Text id="state" name="state" label="State" value={mailingAddress?.state} />
                                        <V.Text id="postalCode" name="postalCode" label="Zip Code" value={mailingAddress?.postalCode} inheritedStyles={{ flex: 2 }}/>
                                    </section>
                                </VForm>
                            </fieldset>
                            
                        </div>

                        <div id="memberships" className={basePageStyles.profileSegment} style={{gridRowStart:"span 2"}}>
                            <fieldset className="button-stack">
                                <legend>Membership</legend>
                                <div id="ensemble-membership-list">
                                    { ensembleCards }
                                </div>
                                <button id="add-membership" onClick={() => newMembershipModal()}>Add Membership</button>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <Link href="/members"><button className="icon-and-label"><i>arrow_back</i>Back to Members</button></Link>
            </div>
        </div>
    )

}

export default memberProfile;