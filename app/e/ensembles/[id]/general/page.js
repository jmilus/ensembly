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
            search={{ label: "Search Members", searchProp: "name" }}
            columns={{ count: 1, width: "1fr" }}
            rows="min-content"
            style={{width: "300px"}}
        >
            {
                memberships.map((membership, m) => {
                    const member = membership.Member;
                    return (
                        <ItemCard
                            key={m}
                            tag="member"
                            name={member.aka}
                            caption={member.aka}
                            type="mini"
                        />
                    )
                })
            }
        </FilterContainer>
    )
}