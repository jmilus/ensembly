import 'server-only';

import { getOneBroadcast } from '@/api/messages/broadcasts/[id]/route';
import { getManyEmails } from '@/api/emails/route';

import { nester } from 'utils';
import { slateToHtml } from 'utils/slateToHtml';

import Broadcast from '../Broadcast'
import Addresser from '../Addresser';
import TabControl, { Tab } from 'components/TabControl';
import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard';
import { Button } from 'components/Vcontrols';


const BroadcastDetailsPage = async (context) => {
    const broadcast = await getOneBroadcast(context.params.id)
    const ensembleemails = await getManyEmails("ensemble")

    if (broadcast.status === "PUBLISHED") {
        return (
            <article>
                <section style={{ flex: 1 }}>
                    <fieldset id="broadcast-read-only" className="tall" style={{flex: 1, display: "flex", flexDirection: "column"}}>
                        <legend>Message Body</legend>
                        <div id="broadcast-subject-read-only" style={{margin: "10px 0", height: "57px", padding: "15px 5px"}}>
                            <div style={{ fontSize: "1.5em" }}>{broadcast.subject}</div>
                            <div style={{ color: "var(--mint6)" }}>{`sent: ${new Date(broadcast.status_date).toLocaleString()}`}</div>
                        </div>
                        <div id="broadcast-body-read-only" style={{ flex: 1, width: "100%" }}>
                            <iframe srcDoc={slateToHtml(broadcast.body)} style={{ flex: 1, border: "1px solid var(--gray3)", background: "var(--gray0)", height: "100%", width: "100%" }} />
                        </div>
                    </fieldset>
                    <fieldset id="broadcast-recipients-read-only" className="tall" style={{ width: "300px", maxWidth: "300px", marginLeft: "10px" }}>
                        <legend>Recipients</legend>
                        <FilterContainer
                            id="cc-filter"
                            filterTag="contact"
                            search={{ label: "contact", searchProp: "email" }}
                            columns={{ count: 1, width: "1fr" }}
                            rows="min-content"
                        >
                            <span>To:</span>
                            {
                                broadcast.to_address.map((contact, c) => {
                                    return <div key={c} filterTag="contact" email={contact}>{contact}</div>
                                })
                            }
                            {broadcast.cc_address.length > 0 &&
                                <>
                                    <span>Cc:</span>
                                    {
                                    broadcast.cc_address.map((contact, c) => {
                                        // console.log("validate:", contact, validateEmail(contact))
                                        // if (!validateEmail(contact)) return;
                                        return <div key={c} filterTag="contact" email={contact}>{contact}</div>
                                    })
                                    }
                                </>
                            }
                            {broadcast.bcc_address.length > 0 &&
                                <>
                                    <span>Bcc:</span>
                                    {
                                    broadcast.bcc_address.map((contact, c) => {
                                        // if (!validateEmail(contact)) return;
                                        return <div key={c} filterTag="contact" email={contact}>{contact}</div>
                                    })
                                    }
                                </>
                            }
                        </FilterContainer>
                    </fieldset>
                </section>
                <section className="button-tray">
                    <Button name="duplicate" caption={<><i>content_copy</i><span>Duplicate</span></>} APIURL={`/api/messages/broadcasts/${broadcast.id}`} METHOD="POST" followPath={`/e/messages/broadcasts/$slug$`} statusCaptions={{ saved: "Duplicated!" }} buttonClass='fit' />
                </section>
            </article>
        )
    }

    const mailgroups = {};

    console.log({ensembleemails})

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

    // console.log("broadcast:", broadcast)

    return (
        <article>
            <section style={{ flex: 1 }}>
                <fieldset className="tall" style={{flex: 1}}>
                    <legend>Composer</legend>
                    <Broadcast
                        subject={broadcast.subject}
                        body={broadcast.body}
                        status={broadcast.status}
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
                                to_address={broadcast.to_address || []}
                                cc_address={broadcast.cc_address || []}
                                bcc_address={broadcast.bcc_address || []}
                                mailgroups={mailgroups}
                            />
                        </Tab>
                    </TabControl>
                </fieldset>
            </section>
            <section className="button-tray">
                <Button name="duplicate" caption={<><i>content_copy</i><span>Duplicate</span></>} APIURL={`/api/messages/broadcasts/${broadcast.id}`} METHOD="POST" followPath={`$slug$`} statusCaptions={{ saved: "Duplicated!" }} buttonClass='fit' />
                <Button name="delete" caption={<><i>delete_forever</i><span>Delete Draft</span></>} APIURL={`/api/messages/broadcasts/${broadcast.id}`} METHOD="DELETE" followPath={`/e/messages/broadcasts/`} statusCaptions={{ saving: "Deleting...", saved: "Broadcast Deleted." }} buttonClass='fit angry' />
                <Button name="send" caption={<><i>send</i><span>Send Broadcast</span></>} APIURL={`/api/messages/broadcasts/send`} METHOD="POST" payload={broadcast.id} followPath={`/e/messages/broadcasts/${broadcast.id}`} statusCaptions={{saving: "Sending...", saved: "Sent!"}} buttonClass='fit happy' style={{ marginLeft: "auto" }} />
            </section>
        </article>
        
    )
}

export default BroadcastDetailsPage;