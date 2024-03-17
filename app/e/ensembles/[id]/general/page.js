import 'server-only';

import { getOneEnsemble } from '@/api/ensembles/[id]/route';

import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard'
import ModalButton from 'components/ModalButton';
import { Form, Text, Button, Select, DateOnly } from 'components/Vcontrols';
import { getManyMembershipTypes } from '@/api/membership/types/route';

export default async function EnsembleGeneralPage({params}) {
    const ensemble = await getOneEnsemble(params.id)
    const membershipTypes = await getManyMembershipTypes(ensemble.id)

    const memberships = ensemble.EnsembleMembership.map(m => m);
    return (
        <>
            <div id="record-header" className="hero-text">{ensemble.name}</div>
            <div id="page" >
                <fieldset style={{ height: "100%" }}>
                    <legend>Members</legend>
                    <ModalButton
                        renderButton={<><i>person_add</i><span>New Member</span></>}
                        buttonClass="fit"
                        title="Create New Member"
                        buttonStyle={{width: "100%", marginBottom: "10px"}}
                    >
                        <Form id="new-member-modal-form" APIURL={`/api/ensembles/${ensemble.id}`} METHOD="POST" followPath="/e/members/$slug$" >
                            <section className="inputs">
                                <Text id="newMemberFirstName" name="firstName" label="First Name" value="" isRequired />
                                <Text id="newMemberLastName" name="lastName" label="Last Name" value="" isRequired />
                            </section>
                            <section className="inputs">
                                <DateOnly id="new-member-membership-start" name="membership_start" label="Membership Start"  isRequired />
                                <Select id="new-member-membership-type" name="membership_type" label="Membership Type" options={membershipTypes}  isRequired />
                            </section>
                        </Form>
                        <section className="modal-buttons">
                            <button name="submit" className="fit" form="new-member-modal-form">Create Member</button>
                        </section>
                    </ModalButton>
                    <FilterContainer
                        id="general-members"
                        filterTag="member"
                        search={{ label: "Search Members", searchProp: "caption" }}
                        style={{ width: "300px" }}
                    >
                        <article className="scroll column" >
                            {
                                memberships.map((membership, m) => {
                                    // console.log({membership})
                                    const member = membership.Member;
                                    return (
                                        <ItemCard
                                            key={m}
                                            filterTag="member"
                                            caption={member.aka}
                                            subtitle={membership.type.name}
                                            captionLinkTo={`/e/members/${member.id}`}
                                            type="mini"
                                        />
                                    )
                                })
                            }
                        </article>
                    </FilterContainer>
                </fieldset>
                <fieldset style={{ height: "100%" }}>
                    <legend>Lineups</legend>
                    <ModalButton
                        renderButton={<><i>add_circle</i><span>Create Lineup</span></>}
                        buttonClass="fit"
                        title="Create New Lineup"
                        buttonStyle={{width: "100%", marginBottom: "10px"}}
                    >
                        <Form id="new-lineup-form" APIURL={`/api/ensembles/${ensemble.id}/lineup`} METHOD="POST" followPath={`/e/ensembles/${ensemble.id}/lineup/$slug$`} debug>
                            <Text id="lineup-name" name="name" label="Lineup Name" isRequired />
                        </Form>
                        <section className="modal-buttons">
                            <button name="submit" className="fit" form="new-lineup-form">Create</button>
                        </section>
                    </ModalButton>
                    <FilterContainer
                        id="ensemble-lineups"
                        filterTag="lineup"
                        search={{ label: "Search Lineups", searchProp: "caption" }}
                        style={{ width: "300px" }}
                    >
                        <article className="scroll column" >
                            {
                                ensemble.Lineup.map((lineup, l) => {
                                    return (
                                        <ItemCard
                                            key={l}
                                            filterTag="lineup"
                                            caption={lineup.name}
                                            captionLinkTo={`/e/ensembles/${ensemble.id}/lineup/${lineup.id}`}
                                            type="mini"
                                        >
                                            {!lineup.is_primary && 
                                                <ModalButton
                                                    renderButton={<i class="switch" style={{['--icon1']:"'delete_outline'", ['--icon2']:"'delete'"}}></i>}
                                                    title="Delete Lineup?"
                                                    modalClasses="warning"
                                                    buttonStyle={{['--edge-color']: "0 90% 50%", marginLeft: "auto"}}
                                                >
                                                    <div className="modal-message">
                                                        <p>Are you sure?</p>
                                                        <p>Deleting this lineup cannot be undone. It will remove <span style={{color: "hsl(var(--color-p))"}}>{lineup.name}</span> from all Events and also delete all assignments to this lineup.</p>
                                                    </div>
                                                    <section className="modal-buttons">
                                                        <Button name="close_modal" buttonClass="angry" APIURL={`/api/ensembles/${ensemble.id}/lineup/${lineup.id}`} METHOD="DELETE">Delete</Button>
                                                    </section>
                                                </ModalButton>
                                            }
                                        </ItemCard>
                                    )
                                })
                            }
                        </article>
                    </FilterContainer>
                </fieldset>
            </div>
        </>
    )
}


// .input-control-base.hero {
//     margin: 20px 0;
//     padding: 0;
// }

// .input-control-base.hero > input,
// .input-control-base.hero > select {
//     font-size: 2.5em;
//     font-family: var(--brand-font);
//     border: none;
//     margin: 0;
//     background-color: transparent;
//     border-radius: 5px;
//     height: 50px;
//     transition: all 0.2s ease;
// }
// .input-control-base.hero > input {
//     padding: 0;
// }