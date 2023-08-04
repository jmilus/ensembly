import { getOneEvent } from '../../../../../api/calendar/event/[id]/route'

import ModalWrapper from "../../../../../../components/ModalWrapper";
import FilterContainer from "../../../../../../components/FilterContainer";
import MemberCard from "../../../../../../components/MemberCard";

export default async function ViewAssignedMembers(context) {
    const event = await getOneEvent(context.params.id);

    let assignments = {}

    event.lineups.forEach(lineup => {
        lineup.assignments.forEach(as => {
            assignments[as.EnsembleMembership.id] = {
                membership: as.EnsembleMembership,
                division: as.Division
            }
        })
    })
    

    return (
        <ModalWrapper title="Attending Members">
            <FilterContainer
                id="assigned-members-filter"
                filterTag="assignee"
                columns={{ c: 3, w: "200px" }}
                search={{ label: "Search", searchProp: "name" }}
                Vstyle={{width: "750px"}}
            >
                {
                    Object.values(assignments).map((assignment, m) => {
                        return (
                            <MemberCard
                                key={m}
                                tag="assignee"
                                membership={assignment.membership}
                                name={assignment.membership.Member.aka}
                                subtitle={assignment.division.name}
                            />
                        )
                    })
                }
            </FilterContainer>
        </ModalWrapper>
    )
}