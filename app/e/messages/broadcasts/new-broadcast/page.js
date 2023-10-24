import 'server-only';

import { getManyEmails } from '@/api/emails/route';

import { nester } from 'utils';

import Broadcast from '../Broadcast'
import Addresser from '../Addresser';
import TabControl, { Tab } from 'components/TabControl';
import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard';
import { Button } from 'components/Vcontrols';

const NewBroadcastPage = async () => {
    const ensembleemails = await getManyEmails("ensemble")

    const mailgroups = {};

    mailgroups.children = ensembleemails.map(ee => {
        return {
            name: ee.name,
            //lineups:
            children: ee.Lineup.map(lu => {
                const lineup = { name: lu.name, children: [] /* divisions */ }

                const tempDivisions = {};
                ee.Division.forEach(div => {
                    tempDivisions[div.id] = { ...div, members: {} };
                })

                lu.LineupAssignment.forEach(la => {
                    // if (!tempDivisions[la.Division.id]) 
                    if (la.EnsembleMembership.Member.EmailAddress[0]?.email) {

                        tempDivisions[la.Division.id].members[la.EnsembleMembership.Member.id] = {
                            id: la.EnsembleMembership.Member.id,
                            name: la.EnsembleMembership.Member.aka,
                            email: la.EnsembleMembership.Member.EmailAddress[0]?.email
                        }
                    }
                })
                lineup.children = nester(Object.values(tempDivisions).map(div => div), "parent_division")
                return lineup;
            })
        }

    })

    const emptyBlock = {type: "standard_paragraph", key: Math.random()}

    return (
        <article>
            <section style={{ flex: 1 }}>
                <fieldset className="tall" style={{flex: 1}}>
                    <legend>Composer</legend>
                    <Broadcast
                        broadcastId="new"
                        subject="New Broadcast"
                        status={"DRAFT"}
                        body={[emptyBlock]}
                    /> 
                </fieldset>
                <fieldset className="tall" style={{width:"300px", maxWidth:"300px", marginLeft: "10px"}}>
                    <legend>Tools</legend>
                    <TabControl >
                        <Tab tabName="Modules">
                            <FilterContainer
                                id="module-filter"
                                filterTag="module"
                                search={{ label: "module", searchProp: "module" }}
                                columns={{ count: 1, width: "1fr" }}
                                rows="min-content"
                            >

                                <ItemCard
                                    cardType="MODULE"
                                    filterTag="module"
                                    module="basic"
                                    dropItem={{ name: "Basic", type: "standard_paragraph" }}
                                    itemIcon={<i style={{ fontSize: "3em", color: "var(--color-p)", cursor: "inherit" }}>view_headline</i>}
                                    caption="Basic"
                                />
                            </FilterContainer>
                        </Tab>
                        <Tab tabName="Recipients">
                            <Addresser
                                to_address={[]}
                                cc_address={[]}
                                bcc_address={[]}
                                mailgroups={mailgroups}
                            />
                        </Tab>
                    </TabControl>
                </fieldset>
            </section>
            <section className="button-tray" style={{height: "38px"}}>
            </section>
        </article>
        
    )
}

export default NewBroadcastPage;