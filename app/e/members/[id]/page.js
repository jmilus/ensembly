import 'server-only';

import { getOneMember } from '@/api/members/[id]/route';
import { getManyEnsembles } from '@/api/ensembles/route';
import { getBioOptions } from '@/api/members/bio/route';
import { getManyMembershipTypes } from '@/api/membership/types/route';

import ProfilePhoto from 'components/ProfilePhoto';
import ItemCard from 'components/ItemCard';
import ModalButton from 'components/ModalButton';
import { Form, Text, Number, Select, DateOnly, Button } from 'components/Vcontrols';
import { getManyDivisions } from '@/api/ensembles/[id]/division/route';
import { getAllMembershipStatus } from '@/api/membership/status/route';
import FilterContainer from 'components/FilterContainer';
import CALENDAR from 'utils/calendarUtils';
import ConfirmButton from 'components/ConfirmButton';

const MemberPage = async (context) => { //
    const member = await getOneMember(context.params.id)
    const ensembleList = await getManyEnsembles();
    const membershipTypes = await getManyMembershipTypes();
    const membershipStatus = await getAllMembershipStatus()

    const divisionOptions = {}
    member.EnsembleMembership.forEach(async membership => {
        divisionOptions[membership.ensemble.id] = await getManyDivisions(membership.ensemble.id)
    })
    
    const bioOptions = await getBioOptions();

    console.log({member})

    const ensembleOptions = {}
    ensembleList.map(ensemble => {
        ensembleOptions[ensemble.id] = { ...ensemble, membershipTypes: [] }
    })
    membershipTypes.forEach(mt => {
        mt.ensembles.forEach(ens => {
            ensembleOptions[ens].membershipTypes.push(mt.id)
        })
    })

    console.log({ensembleOptions})

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
                        <Form id="member-email" APIURL={`/api/emails/${member.EmailAddress[0]?.id}`} auxData={{memberId: member.id, type: "Primary"}} auto >
                            <Text id="email" name="email" format="email" label="Email" value={member.EmailAddress[0]?.email} />
                        </Form>
                        <Form id="member-phone" APIURL={`/api/phonenumber/${member.PhoneNumber[0]?.id}`} auxData={{memberId: member.id, type: "Primary"}} auto >
                            <Text id="phone" name="number" label="Phone Number" format="phone" value={member.PhoneNumber[0]?.phonenumber} />
                        </Form>
                    </section>

                    <Form id="address" APIURL={`/api/address/${member.Address[0]?.id}`} auxData={{ memberId: member.id, type: "Home" }} auto >
                        <Text id="street1" name="street" label="Street" value={member.Address[0]?.street} />
                        <Text id="street2" name="street2" label="Street 2" value={member.Address[0]?.street2} />
                        <section className="inputs">
                            <Text id="city" name="city" label="City" value={member.Address[0]?.city} style={{ flex: 4 }} />
                            <Text id="state" name="state" label="State" value={member.Address[0]?.state} />
                            <Text id="postalCode" name="postalCode" label="Zip Code" value={member.Address[0]?.postalCode} style={{ flex: 2 }}/>
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
                            <DateOnly id="membership-start-date" name="membership_start" label="Membership Start" isRequired />
                            <section className="modal-fields inputs">
                                <Select id="membershipType" name="membership_type" label="Type" options={membershipTypes} isRequired debug >
                                    <Select id="ensembleName" name="ensemble" label="Ensemble" options={ensembleOptions} filterKey="membershipTypes" isRequired debug />
                                </Select>
                            </section>
                        </Form>
                        <section className="modal-buttons">
                            <button name="submit" className="fit" form="add-membership-form">Submit</button>
                        </section>
                    </ModalButton>
                    <div id="ensemble-membership-list" style={{ marginTop: "10px" }}>
                        <FilterContainer
                            id="membership-filter"
                            filterTag="membership"
                            defaultFilter={{ ["membership-status"]: { filterBy: "membershipStatus", filterParams: { Active: { caption: "Active" } } } }}
                            columns={{ count: 1, width: "1fr" }}
                            filters={[
                                { name: "membership-status", filterBy: "membershipStatus", buttons: membershipStatus.map(ms => { return { caption: ms.type } }) }
                            ]}
                        >
                            <article className="scroll column">
                                {
                                    member.EnsembleMembership.map((membership, i) => {
                                        console.log("membership:", membership)
                                        const lineupList = {}
                                        membership.assignments.forEach((assignment, a) => { 
                                            if (!lineupList[assignment.Lineup.id]) lineupList[assignment.Lineup.id] = {name: assignment.Lineup.name, assignments: []}
                                            lineupList[assignment.Lineup.id].assignments.push({title: assignment.title, divId: assignment.Division.id, divName: assignment.Division.name})
                                        })
                                        // const divisionOptions = await getManyDivisions(membership.ensemble.id)
                                        const modalTitle = <><section><span style={{ color: "var(--color-c2)", marginRight: "10px" }}>{membership.membership_type.name}</span><span>{membership.ensemble.name}</span></section>
                                            <section style={{ fontSize: "0.65em", display: "flex", alignItems: "center" }}>
                                                <span style={{ color: "var(--color-c2)", marginRight: "10px" }}>Member Since</span>
                                                <span >{membership.membership_start ? CALENDAR.straightDate(membership.membership_start).toLocaleDateString() : ""}</span>
                                            </section>
                                        </>
                                        //
                                        
                                        //
                                        return (
                                            <ItemCard
                                                key={i}
                                                caption={membership.ensemble.name}
                                                filterTag="membership"
                                                membershipStatus={membership.status}
                                                style={{borderLeftWidth: "15px", borderLeftColor: `hsl(${membershipStatus.find(ms => ms.type === membership.status).color})`}}
                                            >
                                                <ModalButton
                                                    modalButton={<><i className="naked">feed</i></>}
                                                    title={modalTitle}
                                                    dismiss="Close"
                                                    buttonStyle={{marginLeft: "auto"}}
                                                >
                                                    <article style={{ width: "750px" }}>
                                                        <Form id="membership-details-form" APIURL={`/api/membership/${membership.id}`} auto >
                                                            <section className="inputs" >
                                                                <article style={{flex: 1}}>
                                                                    <Select id="membership-status-select" label="Membership Status" name="status" value={membership.status} options={membershipStatus.map(s => {return {...s, value: s.type} })} debug/>
                                                                    <DateOnly id="membership-expiration-date" label="Membership Expires" name="membership_expires" value={membership.membership_expires} />
                                                                </article>
                                                                <Text id="status-note" label="Status Note" name="status_note" value={membership.status_note} limit={1000} style={{ flex: 2 }} />
                                                            </section>
                                                        </Form>
                                                        <article className="scroll">
                                                            {
                                                                Object.keys(lineupList).map((lineupId, l) => {
                                                                    // if(!assignment.Lineup.is_primary) return null
                                                                    const lineup = lineupList[lineupId]
                                                                    return (
                                                                        <section key={l} className="lineup" style={{padding: "5px 10px", border: "1px solid var(--gray3)", borderRadius: "5px", marginTop : "5px"}}>
                                                                            <div style={{ flex: 2 }}>
                                                                                <span style={{ fontSize: "1.25em" }}>{lineup.name}</span>
                                                                                
                                                                            </div>
                                                                            <div style={{flex: 3}}>
                                                                                {
                                                                                    lineup.assignments.map((assignment, a) => {
                                                                                        return (
                                                                                            <section key={a} className="inputs" style={{alignItems: "center"}}>
                                                                                                <Form id={`${l}-${a}-update-assignment-form`} APIURL={`/api/membership/${membership.id}/lineup/${lineupId}/division/${assignment.divId}`} auto>
                                                                                                    <section className="inputs">
                                                                                                        <Select id={`${l}-${a}-division-select`} label="Division" name="new_division" value={assignment.divId} options={divisionOptions[membership.ensemble.id]} isRequired/>
                                                                                                        <Text id={`${l}-${a}-title-text`} label="Title" name="title" value={assignment.title} />
                                                                                                    </section>
                                                                                                </Form>
                                                                                                <ConfirmButton
                                                                                                    button={<i class="switch" style={{['--icon1']:"'delete_outline'", ['--icon2']:"'delete'" }}></i>}
                                                                                                    style={{ ['--edge-color']: "0 90% 50%" }}
                                                                                                    popupStyle={{background: "var(--gray2)", borderRadius: "5px"}}
                                                                                                >
                                                                                                    <Button
                                                                                                        name="delete-assignment-button"
                                                                                                        APIURL={`/api/membership/${membership.id}/lineup/${lineupId}/division/${assignment.divId}`}
                                                                                                        METHOD="DELETE"
                                                                                                        buttonClass="fit"
                                                                                                        style={{ ['--edge-color']: "0 90% 50%", height: "1.5em", padding: "0 5px" }}
                                                                                                    >Confirm Delete</Button>
                                                                                                </ConfirmButton>
                                                                                                
                                                                                            </section>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </div>
                                                                        </section>
                                                                    )
                                                                })
                                                            }
                                                        </article>
                                                    </article>
                                                    {/* <section className="modal-buttons">
                                                    </section> */}
                                                </ModalButton>
                                            </ItemCard>
                                        )
                                    })
                                }
                            </article>
                        </FilterContainer>
                    </div>
                </fieldset>
            </div>
        </>
    )
}

export default MemberPage;