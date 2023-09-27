import 'server-only';

import FilterContainer from 'components/FilterContainer';
import { BroadcastBox } from '../MessagesHelpers';

import { getManyBroadcasts } from '@/api/messages/broadcasts/route';
import ItemCard from 'components/ItemCard';



const BroadcastsPage = async (context) => {
    const broadcastsList = await getManyBroadcasts()
    // console.log({ broadcastsList });

    return (
        <div className="page-details">
            <fieldset className="tall" style={{width: "300px"}}>
                <legend>Broadcasts</legend>
                <FilterContainer
                    id="broadcasts-filter"
                    filterTag="broadcast"
                    columns={{ count: 1, width: "1fr" }}
                    search={{ label: "Search Broadcasts", searchProp: "subject" }}
                >
                    {
                        broadcastsList.map((bc, b) => {
                            return (
                                <ItemCard
                                    caption={bc.subject}
                                    subtitle={`${bc.status === "DRAFT" ? "Edited: " : "Sent: "}${new Date(bc.status_date).toLocaleString()}`}
                                    cardLinkTo={`/e/messages/broadcasts/${id}`}
                                ></ItemCard>
                            )
                            // return <BroadcastBox key={b} info={bc} tag="broadcast" subject={bc.subject} />
                        })
                    }
                </FilterContainer>
            </fieldset>
            <fieldset className="tall" style={{flex: 1}}>
                <legend>Detail</legend>
                {context.children}
            </fieldset>
        </div>
    )
}

export default BroadcastsPage;