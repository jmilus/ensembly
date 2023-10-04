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
                    columns={{ count: 1, width: "1fr" }}
                    search={{ label: "Search Broadcasts", searchProp: "subject" }}
                    filters={[
                        {name: "status", filterProp: "broadcastStatus", buttons: ["draft", "published"]}
                    ]}
                    debug
                >
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
                                    tag="broadcast"
                                    broadcastStatus={bc.status.toLowerCase()}
                                    highlightWhenSelectedId={bc.id}
                                ></ItemCard>
                            )
                            // return <BroadcastBox key={b} info={bc} tag="broadcast" subject={bc.subject} />
                        })
                    }
                </FilterContainer>
            </fieldset>
            {context.children}
        </div>
    )
}

export default BroadcastsPage;