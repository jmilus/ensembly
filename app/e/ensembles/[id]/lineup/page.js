import { redirect } from 'next/navigation';

import { getManyLineups } from '@/api/ensembles/[id]/lineup/route';

export default async function InitialLineupPage(props) {
    const lineups = await getManyLineups(props.params.id);

    const primeLineup = lineups.find(lu => lu.is_primary === true)
    redirect(`lineup/${primeLineup.id}`)
}