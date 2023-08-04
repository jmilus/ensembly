import 'server-only';

import { redirect } from 'next/navigation';

import { getOneEnsemble } from '../../../../api/ensembles/[id]/route'
import { getManyDivisions } from '../../../../api/ensembles/division/route'
import { getOneLineup } from '../../../../api/ensembles/[id]/lineup/[lineup]/route';

import LineupManager from './Lineup';

const LineupPage = async ({ params }) => {

    const ensemble = await getOneEnsemble(params.id)
    const divisions = await getManyDivisions(ensemble.id)

    if (params.lineup === "x") {
        redirect(`${ensemble.Lineup[0].id}`)
    }
    // const lineupId = params.lineup === "x" ? ensemble.Lineup[0].id : params.lineup;
    const lineup = await getOneLineup(params.lineup);

    return <LineupManager initialProps={{ensemble, divisions, lineup}} />
}

export default LineupPage;