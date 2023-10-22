import 'server-only';

import { getOneEnsemble } from '@/api/ensembles/[id]/route';

import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard'

export default async function EnsembleGeneralPage({params}) {
    const ensemble = await getOneEnsemble(params.id)
    console.log({ensemble})
    const memberships = ensemble.EnsembleMembership.map(m => m);
    return (
        <FilterContainer
            id="general-members"
            filterTag="member"
            search={{ label: "Search Members", searchProp: "caption" }}
            columns={{ count: 1, width: "1fr" }}
            rows="min-content"
            style={{width: "300px"}}
        >
            {
                memberships.map((membership, m) => {
                    console.log({membership})
                    const member = membership.Member;
                    return (
                        <ItemCard
                            key={m}
                            filterTag="member"
                            caption={member.aka}
                            subtitle={membership.type.name}
                            type="mini"
                        />
                    )
                })
            }
        </FilterContainer>
    )
}