'use client'

import { useState, useEffect } from 'react';

import ItemCard from 'components/ItemCard';
import DropContainer from 'components/DropContainer';
import FilterContainer from 'components/FilterContainer';
import TabControl, { Tab } from 'components/TabControl';

import useStatus from 'hooks/useStatus';
import { createPortal } from 'react-dom';

const LineupManager = ({ initialProps }) => { // .name
    // console.log({ initialProps })
    const { ensemble, lineup, capacities, membershipTypes, divisions } = initialProps;

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

    // console.log("View Lineup initialProps:", { initialProps })
    // console.log(assignments);
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
        if(!saved) status.unsaved(undefined, saveAssignments)
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
        return Object.values(assignments).some(assignment => assignment.EnsembleMembership.id === membership.id)
    }

    const getDropTypes = (captype) => {
        const dropTypes = [];
        membershipTypes.forEach(memt => {
            if (memt.capacity.includes(captype)) dropTypes.push(memt.name)
        })
        return dropTypes;
    }

    const memberRosterBox = 
        <div className="full-roster" style={{display: "flex", position: "absolute", marginLeft: "20px", height: "calc(100% -60px)", top: "60px", right: "0px", height: "calc(100% - 60px)",zIndex: 100, width: showRoster ? "250px" : "0px", transition: "all 0.2s ease" }}>
            <div style={{position: "absolute", width: "300px", height: "100%", right: showRoster ? "0px" : "-300px", transition: "all 0.2s ease"}}>
                <div id="popout-tab-button" onClick={() => setShowRoster(!showRoster)}><i>groups</i></div>
                <article style={{ boxShadow: "-1px -1px 1px var(--gray4)", padding: "10px", backgroundImage: "linear-gradient(var(--gray2), var(--gray3))" }}>
                    <FilterContainer
                        id="roster"
                        filterTag="member"
                        columns={{count: 1, width:"1fr"}}
                        search={{ label: "member", searchProp: "caption" }}
                        filters={[
                            { name: "assigned", filterBy: "assigned", buttons: [{ unassigned: false }, { assigned: true }] },
                            { name: "membership-capacity", filterBy: "capacity", buttons: capacities.map(cap => { return {[cap.type]: cap.type}}) },
                            { name: "membership-type", filterBy: "subtitle", buttons: membershipTypes.map(memt => { return {[memt.name]: memt.name}}) }
                        ]}
                    >
                        <DropContainer caption="Remove Assignment" value={{id: "remove"}} dropAction={handleDrop} acceptTypes={membershipTypes.map(type => type.name).flat()} />
                        {
                            roster.map((membership, m) => {
                                console.log({membership})
                                return (
                                    <ItemCard
                                        key={m}
                                        filterTag="member"
                                        caption={membership.Member.aka}
                                        subtitle={membership.type.name}
                                        dropItem={membership}
                                        assigned={isAssignedToLineup(membership)}
                                        capacity={membership.type.capacity}
                                    />
                                )
                            })
                        }
                    </FilterContainer>

                </article>
            </div>
        </div > 
    
    const renderDrops = (divisionChildren, cap) => {
        const divKids = Array.isArray(divisionChildren) ? divisionChildren : Object.values(divisionChildren);
        return divKids.map((item, d) => {
            let dropDivisions = [];
            if (item.capacity != cap.id) return null;
            if (item.children) {
                dropDivisions = renderDrops(item.children, cap)
            }
            const dropTypes = getDropTypes(cap.type)
            return (
                <DropContainer key={item.id} caption={item.name} value={item} dropAction={handleDrop} acceptTypes={dropTypes} >
                    {dropDivisions}
                </DropContainer>
            )
        })
    }

    const checkDescendants = (div, descendantId) => {
        if (div.id === descendantId) return true;
        let isDescendant = false;
        if (div.children) {
            isDescendant = Object.values(div.children).some(child => checkDescendants(child, descendantId))
        }
        return isDescendant;
    }
    
    return (
        <>
            { memberRosterBox }
            <section className="lineup-manager" style={{ flex: 1,  height: "100%", paddingLeft: "10px", paddingRight: showRoster ? "260px" : "0px", transition: "all 0.2s ease"}}>
                <FilterContainer
                    id={`lineup-filter`}
                    filterTag="member"
                    search={{ label: "Search Assignees", searchProp: "caption" }}
                    columns={{ count: 1, width: "1fr" }}
                    rows="auto"
                >
                    <TabControl>
                        {
                            capacities.map((capacity, t) => {
                                // console.log({capacity})
                                return (
                                    <Tab key={t} tabName={capacity.type}>
                                        {
                                            divisions.map((div, d) => {
                                                // console.log({div})
                                                let dropDivisions = [];
                                                if (div.capacity != capacity.id) return null;
                                                if (div.children) {
                                                    dropDivisions = renderDrops(div.children, capacity)
                                                }
                                                const dropTypes = getDropTypes(capacity.type)
                                                return (
                                                    <fieldset key={d} className="card-set" style={{background: "var(--gray1)"}} >
                                                        <legend>{div.name}</legend>
                                                        <DropContainer key={div.id} caption={div.name} value={div} dropAction={handleDrop} acceptTypes={dropTypes} >
                                                            { dropDivisions }
                                                        </DropContainer>
                                                        {
                                                            Object.keys(assignments).map((assignmentId, m) => {
                                                                const assignment = assignments[assignmentId];
                                                                const currentDivision = assignment.newDivision ? assignment.newDivision : assignment.Division;
                                                                const isDescendant = checkDescendants(div, currentDivision.id)
                                                                if (isDescendant)
                                                                    return (
                                                                        <ItemCard
                                                                            key={m}
                                                                            filterTag="member"
                                                                            caption={assignment.EnsembleMembership.Member.aka}
                                                                            subtitle={currentDivision.name}
                                                                            dropItem={{ ...assignment.EnsembleMembership, assignmentId: assignmentId }}
                                                                            cardType={assignment.EnsembleMembership.type.name}
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
            </section>
        </>
    )
    
}

export default LineupManager;