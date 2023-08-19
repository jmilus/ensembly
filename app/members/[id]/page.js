import 'server-only';

import { getOneMember } from '../../api/members/[id]/route';
import { getBioOptions } from '../../api/members/bio/route';

import Link from 'next/link';

import ProfilePhoto from '../../../components/ProfilePhoto';
import EnsembleCard from '../../../components/EnsembleCard';
import { Form, Text, Number, Select, DateOnly } from '../../../components/Vcontrols';

const MemberPage = async (context) => {
    const member = await getOneMember(context.params.id)
    
    const bioOptions = await getBioOptions();

    // console.log({member}, {bioOptions}, {ensembleList})

    return (
        <div className="page-details">
            <article>
                <section>
                    <Form id="aka-form" auto >
                        <Text id="aka" name="aka" label="A.K.A." value={member.aka} hero />
                    </Form>
                </section>
                <section style={{flex: 1}}>
                    <article style={{padding: "5px"}}>
                        <div id="member-photo" style={{ flex: 1 }}>
                            <ProfilePhoto
                                name={member.lastName}
                                profilePic=""
                                // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                            />
                        </div>
                        <div id="member-bio" style={{ flex: 1 }} >
                            <Form id="member-profile" auto debug >
                                <fieldset>
                                    <legend>Bio</legend>
                                    <section>
                                        <Text id="firstName" name="firstName" label="First Name" value={member.firstName} isRequired />
                                        <Text id="middleName" name="middleName" label="Middle Name" value={member.middleName} />
                                        <Text id="lastName" name="lastName" label="Last Name" value={member.lastName} isRequired />
                                    </section>
                                    <section>
                                        <Select id="sex" name="sex" label="Sex" value={member.sex} options={bioOptions.sex} />
                                        <Select id="hair" name="hair" label="Hair Color" value={member.hair} options={bioOptions.hair} />
                                        <Select id="eyes" name="eyes" label="Eye Color" value={member.eyes} options={bioOptions.eyes} />
                                    </section>
                                    <section>
                                        <DateOnly id="birthday" name="birthday" label="Birthday" value={member.birthday} />
                                        <Number id="height" name="height" label="Height" format="height" value={member.height} />
                                        <Number id="weight" name="weight" label="Weight" format="weight" value={member.weight} />
                                    </section>
                                    <section>
                                        <Select id="race" name="race" label="Race" value={member.race} options={bioOptions.race} />
                                        <Text id="ethnicity" name="ethnicity" label="Ethnicity" value={member.ethnicity} />
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
                                    <Form id="member-email" APIURL={`/api/emails/${member.EmailAddress[0]?.id}`} auxData={{memberId: member.id}} auto >
                                        <Text id="email" name="email" label="Email" value={member.EmailAddress[0]?.email} recordId={member.EmailAddress[0]?.id} />
                                    </Form>
                                    <Form id="member-phone" APIURL={`/api/phonenumber/${member.PhoneNumber[0]?.id}`} auxData={{memberId: member.id}} auto >
                                        <Text id="phone" name="number" label="Phone Number" format="phone" value={member.PhoneNumber[0]?.phonenumber} recordId={member.PhoneNumber[0]?.id} />
                                    </Form>
                                </section>

                                <Form id="address" APIURL={`/api/address/${member.Address[0]?.id}`} auxData={{ memberId: member.id }} auto >
                                    <Text id="street1" name="street" label="Street" value={member.Address[0]?.street} />
                                    <Text id="street2" name="street2" label="Street 2" value={member.Address[0]?.street2} />
                                    <section>
                                        <Text id="city" name="city" label="City" value={member.Address[0]?.city} Vstyle={{ flex: 4 }} />
                                        <Text id="state" name="state" label="State" value={member.Address[0]?.state} />
                                        <Text id="postalCode" name="postalCode" label="Zip Code" value={member.Address[0]?.postalCode} Vstyle={{ flex: 2 }}/>
                                    </section>
                                </Form>

                            </fieldset>
                            
                        </div>
                    </article>

                    <article style={{padding: "5px"}}>
                        <div id="memberships">
                            <fieldset className="button-stack">
                                <legend>Membership</legend>
                                <Link href={`/members/${member.id}/$add-membership`}><button className="fit"><i>add</i><span>Add Membership</span></button></Link>
                                <div id="ensemble-membership-list" style={{marginTop:"10px"}}>
                                    {
                                        member.EnsembleMembership.map((membership, i) => {
                                            console.log({membership})
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
            </article>
        </div>
    )
}

export default MemberPage;