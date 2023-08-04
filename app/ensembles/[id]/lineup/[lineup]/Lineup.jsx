'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { nester } from '../../../../../utils/index'

import MemberCard from '../../../../../components/MemberCard';
import DropContainer from '../../../../../components/DropContainer';
import FilterContainer from '../../../../../components/FilterContainer';
import TabControl, { Tab } from '../../../../../components/TabControl';

import useStatus from '../../../../../hooks/useStatus';

const LineupManager = ({ initialProps }) => {
    // console.log({ initialProps })
    const { ensemble, divisions, lineup } = initialProps;

    const lineupObject = {}
    lineup.LineupAssignment.forEach(la => {
        const id = `${la.EnsembleMembership.id}_${la.Division.id}`
        lineupObject[id] = la
    })
    const [assignments, setAssignments] = useState(lineupObject)
    const [deletedAssignments, setDeletedAssignments] = useState({})
    const [saved, setSaved] = useState(true)

    const [showRoster, setShowRoster] = useState(lineup.LineupAssignment.length === 0);

    const roster = ensemble.EnsembleMembership;
    const status = useStatus();
    const router = useRouter();

    // console.log("View Lineup initialProps:", { initialProps })
    console.log(assignments);
    // status.unsaved();

    const saveAssignments = () => {
        status.saving();
        const saveResult = fetch(`/api/ensembles/${ensemble.id}/lineup/${lineup.id}/assignments`, {
            method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    assignments: Object.values(assignments),
                    deletions: Object.values(deletedAssignments)
                })
            })
                .then(response => response.json())
                .then(record => {
                    status.saved()
                    // console.log(record)
                    return record;
                })
                .catch((err) => {
                    status.error('Failed to update lineup assignment', err)
                    // console.error('failed to update lineup assignment:', err);
                    return err;
                })
        setDeletedAssignments([])
        setSaved(true);
    }

    useEffect(() => {
        if(!saved) status.unsaved(saveAssignments)
    }, [assignments, deletedAssignments])

    const handleDrop = async (payload) => {
        // console.log({payload})
        if (!payload.target) return null;
        const { source, target } = payload;
        const membership = {...source};
        const division = {...target};

        const newAssignments = {...assignments}

        if (membership.assignmentId) {
            const { assignmentId } = membership;

            if (division.id === "remove") {
                if (newAssignments[assignmentId].Division) {
                    setDeletedAssignments({ ...deletedAssignments, [assignmentId]: assignments[assignmentId]});
                }
                delete newAssignments[assignmentId]
            } else {
                newAssignments[assignmentId] = deletedAssignments[assignmentId] ? deletedAssignments[assignmentId] :{ ...newAssignments[assignmentId], newDivision: division }
            }
            
        } else {
            const newId = `${membership.id}_${division.id}`
            // if (deletedAssignments[newId]) {
            //     newAssignments[newId] = deletedAssignments[newId];
            //     delete deletedAssignments[newId]
            // } else {
            // }
            newAssignments[newId] = { EnsembleMembership: { ...membership }, newDivision: division}
        }

        setAssignments(newAssignments)
        setSaved(false);
    }

    const isAssignedToLineup = (membership) => {
        if (Object.values(assignments).length === 0) return false;
        return Object.values(assignments).find(assignment => assignment.membership === membership.id)
    }

    const memberRosterBox = 
        <div id="full-roster" style={{display: "flex", position: "relative", marginLeft: "20px", height: "100%", width: showRoster ? "250px" : "0px", transition: "all 0.2s ease" }}>
            <div style={{position: "absolute", width: "250px", height: "100%"}}>
                <div id="popout-tab-button" onClick={() => setShowRoster(!showRoster)}><i>groups</i></div>
                <article style={{ boxShadow: "-1px 0 1px var(--gray4)", padding: "10px", backgroundImage: "linear-gradient(var(--gray2), var(--gray3))" }}>
                    <DropContainer caption="Remove Assignment" value={{id: "remove"}} dropAction={handleDrop} acceptTypes={["CARD-IN"]} />
                    <FilterContainer
                        id="roster"
                        filterTag="member"
                        columns={{count: 1, width:"1fr"}}
                        search={{ label: "member", searchProp: "name" }}
                        filters={[
                            { name: "assigned", filterProp: "assigned", buttons: [{ Unassigned: (prop) => !prop }, { Assigned: (prop) => prop } ] }
                        ]}
                    >
                        {
                            roster.map((membership, m) => {
                                return (
                                    <MemberCard
                                        key={m}
                                        tag="member"
                                        membership={membership}
                                        format="drag"
                                        cardType="CARD-OUT"
                                        name={membership.Member.aka}
                                        assigned={isAssignedToLineup(membership)}
                                    />
                                )
                            })
                        }
                    </FilterContainer>

                </article>
            </div>
        </div >
    
    const renderDrops = (items, cap) => {
        return items.map((item, d) => {
            let dropDivisions = [];
            if (item.capacity != cap) return null;
            if (item.children) {
                dropDivisions = renderDrops(item.children, cap)
            }
            return (
                <DropContainer key={item.id} caption={item.name} value={item} dropAction={handleDrop} acceptTypes={["CARD-IN", "CARD-OUT"]} >
                    {dropDivisions}
                </DropContainer>
            )
        })
    }

    const checkDescendants = (div, descendantId) => {
        if (div.id === descendantId) return true;
        let isDescendant = false;
        if (div.children) {
            isDescendant = div.children.some(child => checkDescendants(child, descendantId))
        }
        return isDescendant;
    }

    const capacities = divisions.map(div => div.capacity)
    
    return (
        <section className="lineup-manager" style={{ flex: 1,  height: "100%", paddingLeft: "10px"}}>
            <FilterContainer
                id={`lineup-filter`}
                title={lineup.name}
                filterTag="member"
                search={{ label: "Search Assignees", searchProp: "name" }}
                columns={{ count: 1, width: "1fr" }}
                rows="unset"
            >
                <TabControl>
                    {
                        ["Performer", "Crew", "Staff"].map((cap, t) => {
                            if (!capacities.includes(cap)) return;
                            return (
                                <Tab key={t} id={cap}>
                                    {
                                        divisions.map((div, d) => {
                                            let dropDivisions = [];
                                            if (div.capacity != cap) return null;
                                            if (div.children) {
                                                dropDivisions = renderDrops(div.children, cap)
                                            }
                                            return (
                                                <fieldset key={d} className="card-set" style={{background: "var(--gray1)"}} >
                                                    <legend>{div.name}</legend>
                                                    <DropContainer key={div.id} caption={div.name} value={div} dropAction={handleDrop} acceptTypes={["CARD-IN", "CARD-OUT"]} >
                                                        { dropDivisions }
                                                    </DropContainer>
                                                    {
                                                        Object.keys(assignments).map((assignmentId, m) => {
                                                            const assignment = assignments[assignmentId];
                                                            // console.log({assignment})
                                                            const currentDivision = assignment.newDivision ? assignment.newDivision : assignment.Division;
                                                            const isDescendant = checkDescendants(div, currentDivision.id)
                                                            if (isDescendant)
                                                                return (
                                                                    <MemberCard
                                                                        key={m}
                                                                        tag="member"
                                                                        membership={{ ...assignment.EnsembleMembership, assignmentId: assignmentId }}
                                                                        subtitle={currentDivision.name}
                                                                        presentation="grid"
                                                                        format="drag"
                                                                        cardType="CARD-IN"
                                                                        name={assignment.EnsembleMembership.Member.aka}
                                                                    />
                                                                )
                                                        })
                                                    }
                                                </fieldset>
                                            )
                                        })
                                    }
                                </Tab>
                            )
                        })
                    }
                    
                </TabControl>
            </FilterContainer>
            {memberRosterBox}
        </section>
    )
    
}

export default LineupManager;