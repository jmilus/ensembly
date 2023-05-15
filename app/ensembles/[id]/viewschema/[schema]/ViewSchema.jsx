'use client'

import { useState } from 'react';

import MemberCard from '../../../../../components/MemberCard';
import DropContainer from '../../../../../components/DropContainer';
import FilterContainer from '../../../../../components/FilterContainer';
import TabControl, { Tab } from '../../../../../components/TabControl';

import useStatus from '../../../../../hooks/useStatus';

const SchemaView = ({ initialProps, params }) => {

    const { ensemble, divisions, schema } = initialProps;
    const { name, roster, typeId } = ensemble;
    const [workingSchema, setWorkingSchema] = useState(schema)
    const [showRoster, setShowRoster] = useState(schema.assignments.length === 0);
    const status = useStatus();

    console.log("View Schema initialProps:", { initialProps })
    console.log(workingSchema);


    const handleDrop = async (payload) => {
        console.log({payload})
        if (!payload.division) return null;
        const { membership, division } = payload;

        const newAssignments = [...workingSchema.assignments]
        console.log("before:", {...newAssignments})
        if (membership.assignmentId) {
            const assignmentIndex = newAssignments.findIndex(assignment => {
                return `${assignment.membershipId}-${assignment.schemaId}-${assignment.divisionId}` === membership.assignmentId;
            })
            if (assignmentIndex < 0) return null;

            if (division.id === "remove") {
                newAssignments.splice(assignmentIndex, 1);
            } else {
                newAssignments[assignmentIndex] = { ...newAssignments[assignmentIndex], assignmentId: `${membership.id}-${workingSchema.id}-${division.id}`, divisionId: division.id, division: division }
            }
            
        } else {
            newAssignments.unshift({ assignmentId: `${membership.id}-${workingSchema.id}-${division.id}`, schemaId: workingSchema.id, membershipId: membership.id, membership: membership, memberId: membership.memberId, capacity: division.capacity, divisionId: division.id, division: division });
        }
        console.log("after:", {...newAssignments})

        const newSchema = { ...workingSchema }
        newSchema.assignments = newAssignments
        setWorkingSchema(newSchema)

        status.saving()
        if (division.id === "remove") {

            return await fetch('/api/ensembles/deleteSchemaAssignment', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    membershipId: membership.id,
                    schemaId: workingSchema.id,
                    divisionId: membership.divisionId
                })
            })
                .then(response => response.json())
                .then(record => {
                    status.saved()
                    console.log(record)
                    return record;
                })
                .catch((err, message) => {
                    console.error('failed to remove assignment:', message);
                    return err;
                })
        } else {

            return await fetch('/api/ensembles/updateSchemaAssignment', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    membershipId: membership.id,
                    memberId: membership.memberId,
                    schemaId: workingSchema.id,
                    capacity: division.capacity,
                    oldDivisionId: membership.divisionId,
                    divisionId: division.id
                })
            })
                .then(response => response.json())
                .then(record => {
                    status.saved()
                    console.log(record)
                    return record;
                })
                .catch((err, message) => {
                    console.error('failed to update schema assignment:', message);
                    return err;
                })
        }

    }

    const sectionDropStyle = {
        baseStyle: { height: "0px" },
        canDropStyle: { height: "100px" },
        hoverStyle: {
            ['--drop-h']: 150,
            ['--drop-s']: '60%',
            ['--drop-l']: '45%'
        },
    }

    const removeSectionDropStyle = {
        baseStyle: { height: "0px" },
        canDropStyle: { height: "100px", minHeight: "100px" },
        hoverStyle: {
            ['--drop-h']: 0,
            ['--drop-s']: '100%',
            ['--drop-l']: '45%'
        },
    }

    const isAssignedToSchema = (membership) => {
        if (workingSchema.assignments.length === 0) return false;
        return workingSchema.assignments?.find(assignment => assignment.membershipId === membership.id)
    }

    const memberRosterBox = 
        <div id="full-roster" style={{display: "flex", marginLeft: "20px", height: "100%", maxWidth: showRoster ? "250px" : "0px", transition: "all 0.2s ease" }}>
            <div style={{position: "relative", }}>
                <div id="tab-button" onClick={() => setShowRoster(!showRoster)}><i>groups</i></div>
                <article style={{ boxShadow: "-1px 0 1px var(--gray4)", padding: "10px", background: "var(--gray4)" }}>
                    <DropContainer caption="Remove Assignment" value={{id: "remove"}} acceptTypes={["CARD-IN"]} dropStyles={removeSectionDropStyle} />
                    <FilterContainer
                        id="roster"
                        filterTag="member"
                        columns={{count: 1, width:"1fr"}}
                        search={{ label: "member", searchProp: "name" }}
                        filters={[
                            { name: "assigned", filterProp: "assigned", buttons: [{ Unassigned: (prop) => !prop }, { Assigned: (prop) => prop } ] }
                        ]}
                    >
                        <article>
                            {
                                roster.map((membership, m) => {
                                    return (
                                        <MemberCard
                                            key={m}
                                            tag="member"
                                            membership={membership}
                                            format="drag"
                                            cardType="CARD-OUT"
                                            dropAction={handleDrop}
                                            name={membership.member.aka}
                                            assigned={isAssignedToSchema(membership)}
                                        />
                                    )
                                })
                            }

                        </article>
                    </FilterContainer>

                </article>
            </div>
        </div >
    
    return (
        <>
            <div>{workingSchema.name}</div>
            <section style={{flex:1, padding: "0 0 0 20px"}}>

                <FilterContainer
                    id={`schema-filter`}
                    filterTag="member"
                    search={{ label: "Search Assignees", searchProp: "name" }}
                    columns={{count:1, width: "1fr"}}
                >
                    <TabControl>
                        {
                            ["Performer", "Crew", "Staff"].map(cap => {
                                return (
                                    <Tab id={cap}>
                                        {
                                            divisions.map((div, d) => {
                                                if (div.capacity != cap) return null;
                                                return (
                                                    <fieldset key={d} className="card-set" style={{background: "var(--gray1)"}} >
                                                        <legend>{div.name}</legend>
                                                        {
                                                            div.childDivisions.map((sd, c) => {
                                                                return <DropContainer key={`d${c}`} caption={sd.name} value={sd} acceptTypes={["CARD-IN", "CARD-OUT"]} dropStyles={sectionDropStyle} />
                                                            })
                                                        }
                                                        
                                                        {
                                                            workingSchema.assignments?.map((assignment, m) => {
                                                                if (assignment.division.parentId != div.id) return null;
                                                                return (
                                                                    <MemberCard
                                                                        key={m}
                                                                        tag="member"
                                                                        membership={{ ...assignment.membership, assignmentId: `${assignment.membershipId}-${workingSchema.id}-${assignment.division.id}`, capacity: cap, divisionId: assignment.divisionId }}
                                                                        subtitle={assignment.division?.name}
                                                                        presentation="grid"
                                                                        format="drag"
                                                                        cardType="CARD-IN"
                                                                        dropAction={handleDrop}
                                                                        name={assignment.membership.member.aka}
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
        </>
    )
}

export default SchemaView;