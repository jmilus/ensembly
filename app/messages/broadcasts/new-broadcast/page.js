import 'server-only';

import Broadcast from '../../../../components/Broadcast'

const NewBroadcastPage = async () => {

    return (
        <Broadcast broadcastId="new" subject="" body={[]} status="DRAFT" /> 
    )
}

export default NewBroadcastPage;