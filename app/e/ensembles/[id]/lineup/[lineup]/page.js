import 'server-only';

import { redirect } from 'next/navigation';

import { getOneEnsemble } from '@/api/ensembles/[id]/route'
import { getOneLineup } from '@/api/ensembles/[id]/lineup/[lineup]/route';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

import LineupManager from './Lineup';
import { getAllMembershipTypes } from '@/api/membership/types/route';
import { getManyDivisions } from '@/api/ensembles/[id]/division/route';

const LineupPage = async ({ params }) => {

    const ensemble = await getOneEnsemble(params.id)
    const allcapacities = await getAllMembershipCapacities()
    const membershipTypes = await getAllMembershipTypes(params.id)
    const divisions = await getManyDivisions(params.id)

    const membershipcapacities = membershipTypes.map(mt => {
        return mt.capacity
    }).flat()

    const capacities = allcapacities.filter(ac => {
        return membershipcapacities.includes(ac.type)
    })

    if (params.lineup === "x") {
        const primeLineup = ensemble.Lineup.find(lu => lu.is_primary === true)
        redirect(`${primeLineup.id}`)
    }

    const lineup = await getOneLineup(params.lineup);

    return <LineupManager initialProps={{ensemble, lineup, capacities, divisions}} />
}

export default LineupPage;