import { getOneEventModel } from "../../../../../../api/calendar/event/model/[model]/route";

import ModalWrapper from "../../../../../../../components/ModalWrapper";
import FilterContainer from "../../../../../../../components/FilterContainer";
import MemberCard from "../../../../../../../components/MemberCard";
import { ClientConsole } from "../../../../../../../components/ClientConsole";

export default async function ViewAssignedMembers(context) {
    const model = await getOneEventModel(context.params.model);

    let assignments = {}
    model.events.forEach(event => {
        event.lineups.forEach(lineup => {
            lineup.assignments.forEach(as => {
                assignments[as.EnsembleMembership.id] = {
                    membership: as.EnsembleMembership,
                    division: as.Division
                }
            })
        })
    })
    

    return (
        <ModalWrapper title="Attending Members">
            <ClientConsole items={assignments} />
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