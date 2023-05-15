import 'server-only';

import { fetchOneMember } from '../../../pages/api/members/getOneMember';
import { fetchManyEnsembles } from '../../../pages/api/ensembles/getManyEnsembles';

import SecurityWrapper from '../../../components/SecurityWrapper';
import ProfilePhoto from '../../../components/ProfilePhoto';
import EnsembleCard from '../../../components/EnsembleCard';
import { Form, Text, Number, Select, DateTime } from '../../../components/Vcontrols';
import Modal2 from '../../../components/Modal2';

import { Race, Sex, HairColor, EyeColor, EmailRank, AddressRank, PhoneRank } from '@prisma/client';

const MemberPage = async (context) => {
    const member = await fetchOneMember(context.params.id)
    const ensembleList = await fetchManyEnsembles();

    return (
        <SecurityWrapper module="members" selfIdentifier={member.emails[0]?.email}>
            <section style={{flex: 1}}>
                <article style={{padding: "5px"}}>
                    <div id="member-photo" style={{flex:1}}>
                        <ProfilePhoto
                            name={member.lastName}
                            profilePic=""
                            // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                        />
                    </div>
                    <div id="member-bio" style={{ flex: 1 }} >
                        <Form id="member-profile" APIURL="/members/updateMember" recordId={member.id} auto debug >
                            <fieldset>
                                <legend>Bio</legend>
                                <section>
                                    <Text id="firstName" name="firstName" label="First Name" value={member.firstName} isRequired />
                                    <Text id="middleName" name="middleName" label="Middle Name" value={member.middleName} />
                                    <Text id="lastName" name="lastName" label="Last Name" value={member.lastName} isRequired />
                                </section>
                                <section>
                                    <Select id="sex" name="sex" label="Sex" value={member.memberBio?.sex} options={Sex} />
                                    <Select id="hair" name="hair" label="Hair Color" value={member.memberBio?.hair} options={HairColor} />
                                    <Select id="eyes" name="eyes" label="Eye Color" value={member.memberBio?.eyes} options={EyeColor} />
                                </section>
                                <section>
                                    <DateTime id="birthday" name="birthday" label="Birthday" value={member.memberBio?.birthday} />
                                    <Number id="height" name="height" label="Height" format="height" value={member.memberBio?.height} />
                                    <Number id="weight" name="weight" label="Weight" format="weight" value={member.memberBio?.weight} />
                                </section>
                                <section>
                                    <Select id="race" name="race" label="Race" value={member.memberBio?.race} options={Race} />
                                    <Text id="ethnicity" name="ethnicity" label="Ethnicity" value={member.memberBio?.ethnicity} />
                                </section>
                            </fieldset>
                        </Form>
                    </div>
                </article>
                    
                <article style={{padding: "5px"}}>
                    <div id="member-contacts" style={{ flex: 1 }}>
                        <fieldset>
                            <legend>Contact Info</legend>
                            <section>
                                <Form id="member-email" APIURL="/members/updateEmail" additionalIds={{memberId: member.id}} auto >
                                    <Text id="email" name="email" label="Email" value={member.emails[0]?.email} recordId={member.emails[0]?.id} />
                                </Form>
                                <Form id="member-phone" APIURL="/members/updatePhoneNumber" additionalIds={{memberId: member.id}} auto >
                                    <Text id="phone" name="phonenumber" label="Phone Number" format="phone" value={member.phoneNumbers[0]?.phonenumber} recordId={member.phoneNumbers[0]?.id} />
                                </Form>
                            </section>

                            <Form id="address" APIURL="/general/updateAddress" additionalIds={{ memberId: member.id }} recordId={member.addresses[0]?.id} auto >
                                <Text id="street1" name="street" label="Street" value={member.addresses[0]?.street} />
                                <Text id="street2" name="street2" label="Street 2" value={member.addresses[0]?.street2} />
                                <section>
                                    <Text id="city" name="city" label="City" value={member.addresses[0]?.city} Vstyle={{ flex: 4 }} />
                                    <Text id="state" name="state" label="State" value={member.addresses[0]?.state} />
                                    <Text id="postalCode" name="postalCode" label="Zip Code" value={member.addresses[0]?.postalCode} Vstyle={{ flex: 2 }}/>
                                </section>
                            </Form>

                        </fieldset>
                        
                    </div>
                </article>

                <article style={{padding: "5px"}}>
                    <div id="memberships">
                        <fieldset className="button-stack">
                            <legend>Membership</legend>
                            <Modal2
                                modalButton={<button><i>add</i><span>Add Membership</span></button>}
                                title="Add Membership"
                            >
                                <Form id="add-membership-form" APIURL="/members/updateMembership" additionalIds={{ memberId: member.id }} >
                                    <Select id="ensembleName" name="ensembleId" label="Ensemble" options={ensembleList} />
                                    <section className="modal-buttons">
                                        <button name="submmit">Submit</button>
                                        <button name="cancel">Cancel</button>
                                    </section>
                                </Form>
                            </Modal2>
                            <div id="ensemble-membership-list">
                                {
                                    member.memberships.map((membership, i) => {
                                        return (
                                            <EnsembleCard
                                                key={i}
                                                name
                                                membership={membership}
                                                ensemble={membership.ensemble}
                                                presentation="list"
                                                format="membership"
                                            />
                                        )
                                    })
                                }
                            </div>
                        </fieldset>
                    </div>
                </article>

            </section>
        </SecurityWrapper>
    )
}

export default MemberPage;