import 'server-only';

import { getAllMembers } from '@/api/members/route';

import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard';

const MembersPage = async () => {

    const members = await getAllMembers();

    return (
        <div id="page">
            <FilterContainer
                id="members-filter"
                filterTag="member"
                columns={{count: "auto-fill", width: "201px"}}
                search={{ label: "Search Members", searchProp: "name" }}
                filters={[
                    { name: "sex", filterProp: "sex", buttons: ["male", "female", "unspecified"] }
                ]}
            >
                {
                    members.map((member, i) => {
                        return (
                            <ItemCard
                                key={i}
                                tag="member"
                                name={member.aka}
                                caption={member.aka}
                                cardLinkTo={`/e/members/${member.id}`}
                                type="profile"
                            />
                        )
                    })
                }
            </FilterContainer>
        </div>
    )
}

export default MembersPage;