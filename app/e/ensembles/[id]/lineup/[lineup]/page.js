import 'server-only';

import { redirect } from 'next/navigation';

import { getOneEnsemble } from '@/api/ensembles/[id]/route'
import { getOneLineup } from '@/api/ensembles/[id]/lineup/[lineup]/route';

import LineupManager from './Lineup';

const LineupPage = async ({ params }) => {

    const ensemble = await getOneEnsemble(params.id)

    if (params.lineup === "x") {
        const primeLineup = ensemble.Lineup.find(lu => lu.is_primary === true)
        redirect(`${primeLineup.id}`)
    }

    const lineup = await getOneLineup(params.lineup);

    return <LineupManager initialProps={{ensemble, lineup}} />
}

export default LineupPage;