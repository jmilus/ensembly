import 'server-only';

import { getAllMembershipTypes } from '@/api/membership/types/route';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

import ItemCard from 'components/ItemCard';
import { Collection, Form, Number, Select, Text } from 'components/Vcontrols';
import ModalButton from 'components/ModalButton';
import FilterContainer from 'components/FilterContainer';
import { getManyEnsembles } from '@/api/ensembles/route';

export default async function MembershipSettingsPage(context) {
    const membershipTypes = await getAllMembershipTypes()
    const capacities = await getAllMembershipCapacities()
    const ensembles = await getManyEnsembles()
    const termPeriod = [
        { id: 1, caption: "Week" },
        { id: 2, caption: "Month" },
        { id: 3, caption: "Year" }
    ]

    console.log({ ensembles })
    console.log({ membershipTypes })
    return (
        <FilterContainer
            id="memberships-filter"
            filterTag="membership"
            search={{label: "Search Membership Types", searchProp: "name"}}
            columns={{ count: "auto-fill", width: "500px" }}
            style={{marginTop: "40px"}}
        >
            {
                membershipTypes.map((type, t) => {
                    const ensembleList = ensembles.filter(e => type.ensembles.includes(e.id))
                    return (
                        <ItemCard
                            key={t}
                            itemIcon={<i>verified</i>}
                            style={{ ['--hero-size']: "75px" }}
                            cardBodyStyle={{ width: "75%" }}
                            filterTag="membership"
                            name={type.name}
                            // name={type.name}
                            // subtitle="membership type"
                        >
                            <article>
                                <span style={{fontSize: "2em"}}>{type.name}</span>
                                <section>
                                    <span style={{color: "var(--mint6)", marginRight:"10px"}}>Membership Term:</span>
                                    <span>{`${type.term_length} ${termPeriod.find(period => period.id === type.term_period).caption}s`}</span>
                                </section>
                                <section>
                                    <span style={{color: "var(--mint6)", marginRight:"10px"}}>Capacities:</span>
                                    {
                                        type.capacity.join(", ")
                                    }
                                </section>
                                <section>
                                    <span style={{color: "var(--mint6)", marginRight:"10px"}}>Ensembles:</span>
                                    {
                                        ensembleList.map(e => e.name).join(", ")
                                    }
                                </section>
                            </article>
                            <ModalButton
                                modalButton={<i>edit</i>}
                                buttonClass="fit"
                                title={`Edit Membership Type ${type.name}`}
                            >
                                <Form id="membership-type-form" APIURL="/api/membership/types" METHOD="PUT" auxData={{id: type.id}} debug>
                                    <Text id="membership-typ-name" name="name" label="Type Name" value={type.name} isRequired />
                                    <section className="inputs">
                                        <Number id="membership-term-length" name="term_length" label="Expires in" value={type.term_length} style={{ flex: 1 }} isRequired />
                                        <Select id="memberhsip-term-period" name="term_period" label="" options={termPeriod} value={type.term_period} style={{ flex: 5 }} isRequired />
                                    </section>
                                    <Collection id="membership-capacities" name="capacity" label="Capacities" options={capacities.map(cap => cap.type)} value={type.capacity} isRequired />
                                    <Collection id="membership-ensembles" name="ensembles" label="Ensembles" options={ensembles} value={ensembles.filter(e => type.ensembles.includes(e.id))} isRequired debug/>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" className="fit" form="membership-type-form">Save</button>
                                </section>
                            </ModalButton>
                        </ItemCard>
                    )
                })
            }
        </FilterContainer>
    )
}