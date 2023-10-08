import 'server-only';

import { getOneMember } from '@/api/members/[id]/route';
import { getManyEnsembles } from '@/api/ensembles/route';
import { getBioOptions } from '@/api/members/bio/route';
import { getAllMembershipTypes } from '@/api/membership/types/route';

import ProfilePhoto from 'components/ProfilePhoto';
import ItemCard from 'components/ItemCard';
import ModalButton from 'components/ModalButton';
import { Form, Text, Number, Select, DateOnly } from 'components/Vcontrols';

const MemberPage = async (context) => {
    const member = await getOneMember(context.params.id)
    const ensembleList = await getManyEnsembles();
    const membershipTypes = await getAllMembershipTypes();
    
    const bioOptions = await getBioOptions();

    const ensembleOptions = membershipTypes.map(mt => {
        return mt.ensembles.map(ens => {
            const matchingEnsemble = ensembleList.find(el => el.id === ens)
            return {...matchingEnsemble, memType: mt.id}
        })
    }).flat()

    return (
        <>
            <div id="page-header">
                <Form id="aka-form" auto>
                    <Text id="aka" name="aka" label="A.K.A." value={member.aka} hero />
                </Form>
            </div>
            <div
                className="page-grid"
                style={{ gridTemplateAreas: "'photo bio membership' 'photo contacts membership'", gridTemplateColumns: "2fr 3fr 2fr" }}
            >
                <ProfilePhoto
                    name={member.lastName}
                    profilePic=""
                    // profilePic="http://localhost:3100/images/HAPPYJOSH.jpg"
                    style={{ gridArea: "photo"}}
                />
                <fieldset style={{gridArea: "bio"}}>
                    <legend>Bio</legend>
                    <Form id="member-profile" auto>
                        <section className="inputs">
                            <Text id="firstName" name="firstName" label="First Name" value={member.firstName} isRequired />
                            <Text id="middleName" name="middleName" label="Middle Name" value={member.middleName} />
                            <Text id="lastName" name="lastName" label="Last Name" value={member.lastName} isRequired />
                            <Text id="suffix" name="suffix" label="Suffix" value={member.suffix} style={{ maxWidth: "4em" }} />
                        </section>
                        <section className="inputs">
                            <Select id="sex" name="sex" label="Sex" value={member.sex} options={bioOptions.sex} />
                            <Select id="hair" name="hair" label="Hair Color" value={member.hair} options={bioOptions.hair} />
                            <Select id="eyes" name="eyes" label="Eye Color" value={member.eyes} options={bioOptions.eyes} />
                        </section>
                        <section className="inputs">
                            <DateOnly id="birthday" name="birthday" label="Birthday" value={member.birthday} />
                            <Number id="height" name="height" label="Height" format="height" value={member.height} />
                            <Number id="weight" name="weight" label="Weight" format="weight" value={member.weight} />
                        </section>
                        <section className="inputs">
                            <Select id="race" name="race" label="Race" value={member.race} options={bioOptions.race} />
                            <Text id="ethnicity" name="ethnicity" label="Ethnicity" value={member.ethnicity} />
                        </section>
                    </Form>
                </fieldset>
                <fieldset id="member-contacts" style={{gridArea: "contacts"}}>
                    <legend>Contact Info</legend>
                    <section className="inputs">
                        <Form id="member-email" APIURL={`/api/emails/${member.EmailAddress[0]?.id}`} auxData={{memberId: member.id}} auto >
                            <Text id="email" name="email" format="email" label="Email" value={member.EmailAddress[0]?.email} recordId={member.EmailAddress[0]?.id} />
                        </Form>
                        <Form id="member-phone" APIURL={`/api/phonenumber/${member.PhoneNumber[0]?.id}`} auxData={{memberId: member.id}} auto >
                            <Text id="phone" name="number" label="Phone Number" format="phone" value={member.PhoneNumber[0]?.phonenumber} recordId={member.PhoneNumber[0]?.id} />
                        </Form>
                    </section>

                    <Form id="address" APIURL={`/api/address/${member.Address[0]?.id}`} auxData={{ memberId: member.id }} auto >
                        <Text id="street1" name="street" label="Street" value={member.Address[0]?.street} />
                        <Text id="street2" name="street2" label="Street 2" value={member.Address[0]?.street2} />
                        <section className="inputs">
                            <Text id="city" name="city" label="City" value={member.Address[0]?.city} Vstyle={{ flex: 4 }} />
                            <Text id="state" name="state" label="State" value={member.Address[0]?.state} />
                            <Text id="postalCode" name="postalCode" label="Zip Code" value={member.Address[0]?.postalCode} Vstyle={{ flex: 2 }}/>
                        </section>
                    </Form>

                </fieldset>
                
                <fieldset className="button-stack" style={{gridArea: "membership"}}>
                    <legend>Membership</legend>
                    <ModalButton
                        modalButton={<><i>add</i><span>Add Membership</span></>}
                        title="Add Membership"
                        buttonClass="fit"
                    >
                        <Form id="add-membership-form" METHOD="POST" APIURL={`/api/membership`} auxData={{ member: member.id }} >
                            <section className="modal-fields">
                                <Select id="membershipType" name="membershipType" label="Type" options={membershipTypes} isRequired >
                                    <Select id="ensembleName" name="ensemble" label="Ensemble" options={ensembleOptions} filterKey="memType" filter="ensemble" isRequired />
                                </Select>
                            </section>
                        </Form>
                        <section className="modal-buttons">
                            <button name="submit" form="add-membership-form">Submit</button>
                        </section>
                    </ModalButton>
                    <div id="ensemble-membership-list" style={{marginTop:"10px"}}>
                        {
                            member.EnsembleMembership.map((membership, i) => {
                                console.log("membership:", membership.assignments)
                                return (
                                    <ItemCard
                                        key={i}
                                        caption={membership.ensemble.name}
                                    >
                                        <ModalButton
                                            modalButton={<><i className="naked">feed</i></>}
                                            title={membership.ensemble.name}
                                            dismiss="Close"
                                        >
                                            <article>
                                                {
                                                    membership.assignments.map((assignment, a) => {
                                                        if(!assignment.Lineup.is_primary) return null
                                                        return (
                                                            <div key={a} className="assignment">{assignment.Division.name}</div>
                                                        )
                                                    })
                                                }
                                            </article>
                                            <section className="modal-buttons">
                                                <button className="caution">Suspend</button>
                                                <button className="angry">Terminate</button>
                                            </section>
                                        </ModalButton>
                                    </ItemCard>
                                )
                            })
                        }
                    </div>
                </fieldset>
            </div>
        </>
    )
}

export default MemberPage;