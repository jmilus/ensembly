import 'server-only';

import FilterContainer from '../../../components/FilterContainer';
import { BroadcastBox } from '../MessagesHelpers';

import { fetchManyBroadcasts } from '../../../pages/api/messages/getManyBroadcasts';

import ModalButton from '../../../components/ModalButton';

import '../messages.css';

const BroadcastsPage = async (context) => {
    const broadcastsList = await fetchManyBroadcasts()
    console.log({ broadcastsList });

    return (
        <div className="page-details">
            <article style={{paddingLeft: "10px"}}>
                <section>
                    
                </section>
                <section style={{flex: 1, overflow: "hidden"}}>
                    <fieldset className="tall" style={{width: "300px"}}>
                        <legend>Broadcasts</legend>
                        <FilterContainer
                            id="broadcasts-filter"
                            filterTag="broadcast"
                            columns={{count: 1, width: "1fr"}}
                        >
                            {
                                broadcastsList.map(bc => {
                                    return <BroadcastBox info={bc} />
                                })
                            }
                        </FilterContainer>
                    </fieldset>
                    <fieldset className="tall" style={{flex: 1}}>
                        <legend>Detail</legend>
                        {context.children}
                    </fieldset>
                </section>
            </article>

        </div>
    )
}

export default BroadcastsPage;