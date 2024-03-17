import 'server-only';

import { getOneEnsemble } from '@/api/ensembles/[id]/route'
import { getOneLineup } from '@/api/ensembles/[id]/lineup/[lineup]/route';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

import LineupManager from './Lineup';
import { getManyMembershipTypes } from '@/api/membership/types/route';
import { getManyDivisions } from '@/api/ensembles/[id]/division/route';

const LineupPage = async ({ params }) => {
    const ensemble = await getOneEnsemble(params.id)
    const lineup = await getOneLineup(params.lineup);
    const allcapacities = await getAllMembershipCapacities()
    const membershipTypes = await getManyMembershipTypes(params.id)
    const divisions = await getManyDivisions(params.id, true)

    const membershipcapacities = membershipTypes.map(mt => {
        return mt.capacity
    }).flat()

    const capacities = allcapacities.filter(ac => {
        return membershipcapacities.includes(ac.type)
    })

    console.log({ params })

    return <LineupManager initialProps={{ensemble, lineup, capacities, membershipTypes, divisions}} />
}

export default LineupPage;