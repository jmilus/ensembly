import 'server-only';

import {fetchOneBroadcast} from '../../../../pages/api/messages/getOneBroadcast';

import Broadcast from '../../../../components/Broadcast'

const BroadcastDetailsPage = async (context) => {
    const [broadcast] = await fetchOneBroadcast(context.params.id)

    // const broadcastBody = JSON.parse(broadcast.body)
    console.log("broadcast:", broadcast)

    return (
        <Broadcast broadcastId={broadcast.id} subject={broadcast.subject} body={broadcast.body} status={broadcast.status} /> 
    )
}

export default BroadcastDetailsPage;