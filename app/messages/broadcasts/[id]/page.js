import 'server-only';

import { getOneBroadcast } from '../../../api/messages/broadcasts/[id]/route';
import { getManyEmails } from '../../../api/emails/route';

import Broadcast from '../../../../components/Broadcast'

const BroadcastDetailsPage = async (context) => {
    const [broadcast] = await getOneBroadcast(context.params.id)
    const groups = await getManyEmails("ensemble", '13117da3-4062-4c18-bb01-0c4945e7c105')

    console.log("broadcast:", broadcast)

    return (
        <Broadcast broadcastId={broadcast.id} subject={broadcast.subject} body={broadcast.body} status={broadcast.status} groups={groups} /> 
    )
}

export default BroadcastDetailsPage;