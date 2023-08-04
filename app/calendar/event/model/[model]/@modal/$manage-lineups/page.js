import { getOneEventModel } from '../../../../../../api/calendar/event/model/[model]/route';
import { getManyLineups } from '../../../../../../api/ensembles/[id]/lineup/route';
import { LineupsGrid } from '../../../../../CalendarHelpers';

export default async function ManageLineups(context) {
    const model = await getOneEventModel(context.params.model);
    const lineups = await getManyLineups();

    return (
        <LineupsGrid model={model} allLineups={lineups}/>
    )
}