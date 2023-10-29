import 'server-only';

import FilterContainer from 'components/FilterContainer';
import { BroadcastBox } from '../MessagesHelpers';

import { getManyBroadcasts } from '@/api/messages/broadcasts/route';
import ItemCard from 'components/ItemCard';



const BroadcastsPage = async (context) => {
    const broadcastsList = await getManyBroadcasts()
    // console.log({ broadcastsList });

    return (
        <div id="page">
            <fieldset className="tall" style={{width: "300px"}}>
                <legend>Broadcasts</legend>
                <FilterContainer
                    id="broadcasts-filter"
                    filterTag="broadcast"
                    search={{ label: "Search Broadcasts", searchProp: "caption" }}
                    filters={[
                        {name: "status", mode: "exclusive", filterBy: "broadcastStatus", buttons: [{caption: "draft"}, {caption: "published"}]}
                    ]}
                >
                    <article className="scroll column" style={{ ['--min-width']: "300px" }}>
                        {
                            broadcastsList.map((bc, b) => {
                                return (
                                    <ItemCard
                                        key={b}
                                        itemIcon={<i style={{fontSize: "2em"}}>{bc.status === "DRAFT" ? "edit_note" : "outgoing_mail"}</i>}
                                        caption={bc.subject}
                                        subtitle={`${bc.status === "DRAFT" ? "Edited: " : "Sent: "}${new Date(bc.status_date).toLocaleString()}`}
                                        cardLinkTo={`/e/messages/broadcasts/${bc.id}`}
                                        style={bc.status === "DRAFT" ? { color:  "hsl(var(--color-s))" } : { color: "hsl(var(--color-p))", background: "hsl(var(--color-s))" }}
                                        filterTag="broadcast"
                                        broadcastStatus={bc.status.toLowerCase()}
                                        highlightWhenSelectedId={bc.id}
                                    ></ItemCard>
                                )
                                // return <BroadcastBox key={b} info={bc} tag="broadcast" subject={bc.subject} />
                            })
                        }
                    </article>
                </FilterContainer>
            </fieldset>
            {context.children}
        </div>
    )
}

export default BroadcastsPage;