import { LineupSelector } from '../../EnsemblesHelpers';

import { getManyLineups } from '@/api/ensembles/[id]/lineup/route';

export default async function InitialLineupPage(props) {
    const lineups = await getManyLineups(props.params.id);
    console.log("wheeeeeeeeeeeeee", { lineups })
    return <LineupSelector lineups={lineups} />
}