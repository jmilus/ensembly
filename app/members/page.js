import 'server-only';

import { createClient } from '../../utils/supabase-server';
import { fetchManyMembers } from '../../pages/api/members/getManyMembers';
import { loadUserPermissions } from '../../pages/api/general/getUserPermissions';

import FilterContainer from '../../components/FilterContainer';
import MemberCard from '../../components/MemberCard';

import {MemberNav} from './MembersHelpers';

const MembersPage = async () => {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    
    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    const members = await fetchManyMembers();

    if (security.modules.members) {

        return (
            <div className="page-base">
                <div className="action-section">
                    <MemberNav  />
                </div>
                <div className="form-section">
                    <div className="page-details">
                        <FilterContainer
                            id="members-filter"
                            filterTag="member"
                            columns={{count: "auto-fill", width: "200px"}}
                            search={{ label: "Search Members", searchProp: "name" }}
                            filters={[
                                { name: "sex", filterProp: "sex", buttons: ["male", "female", "unspecified"] }
                            ]}
                        >
                            {
                                members.map((member, i) => {
                                    return (
                                        <MemberCard
                                            key={i}
                                            tag="member"
                                            membership={{member}}
                                            presentation={"grid"}
                                            format={"detail"}
                                            name={member.aka}
                                            sex={member.memberBio.sex}
                                        />
                                    )
                                })
                            }
                        </FilterContainer>
                    </div>
                </div>
            </div>
        )
    } else {
        throw new Error("You do not have permissions to access this module.");
    }
}

export default MembersPage;