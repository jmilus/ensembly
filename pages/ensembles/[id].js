import { useState, useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import Link from 'next/link';

import VForm from '../../components/VForm';
import V from '../../components/ControlMaster';
import MemberCard from '../../components/MemberCard';
import TabControl, { Tab } from '../../components/TabControl';
import DropContainer from '../../components/DropContainer';

import { GlobalContext } from "../_app";

import basePageStyles from '../../styles/basePage.module.css';

import { fetchOneEnsemble } from '../api/ensembles/getOneEnsemble';
import { fetchManyDivisions } from '../api/ensembles/getManyDivisions';
import { fetchOneSchema } from '../api/ensembles/getOneSchema';

export async function getServerSideProps(context) {
    const ensemble = await fetchOneEnsemble(context.params.id);
    const baseSchema = await fetchOneSchema(ensemble.schema[0].id)
    const divisions = await fetchManyDivisions(ensemble.typeId);
    
    return {
        props: {
            ensemble,
            baseSchema,
            divisions,
        }
    }
}

const ensembleProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    
    const [ensemble, updateEnsemble] = useImmer(initialProps.ensemble);
    const [viewSchema, updateViewSchema] = useImmer(initialProps.baseSchema)
    const [showRoster, setShowRoster] = useState(false);
    const router = useRouter();

    useLoader(ensemble.id, updateEnsemble, `/api/ensembles/getOneEnsemble?id=${ensemble.id}`);
    useLoader(viewSchema?.id, updateViewSchema, `/api/ensembles/getOneSchema?id=${viewSchema?.id}`)

    const { divisions } = initialProps;
    const { name, membership, typeId } = ensemble;

    console.log({ ensemble }, { membership }, { divisions }, { viewSchema });

    const loadSchema = async (schemaId) => {
        const fetchedSchema = await fetch(`/api/ensembles/getOneSchema?id=${schemaId}`)
        const loadedSchema = await fetchedSchema.json();
        updateViewSchema(loadedSchema);
    }

    const handleDrop = async (payload) => {
        console.log({payload})
        if (!payload.value) return null;
        const { item, value } = payload;

        updateViewSchema(draft => {
            if (item.assignmentId) {
                let index = viewSchema.assignments.findIndex(ass => {
                    return ass.id === item.assignmentId;
                })

                draft.assignments[index] = { ...draft.assignments[index], divisionId: value.id, division: value, test: true }
            } else {
                if (item.assignmentTempId) {
                    let index = viewSchema.assignments.findIndex(ass => {
                        return ass.assignmentTempId === item.assignmentTempId;
                    })
                    draft.assignments[index] = { ...draft.assignments[index], divisionId: value.id, division: value, assignmentTempId: `${item.id}-${value.id}` }
                } else {
                    draft.assignments.push({ schemaId: viewSchema.id, member: item, memberId: item.id, capacity: value.capacity, divisionId: value.id, division: value, assignmentTempId: `${item.id}-${value.id}` });
                }
            }

        })

        return await fetch('/api/ensembles/updateSchemaAssignment', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: item.assignmentId,
                schemaId: viewSchema.id,
                memberId: item.id,
                capacity: value.capacity,
                divisionId: value.id
            })
        })
            .then(response => response.json())
            .then(record => {
                console.log(record)
                return record;
            })
            .catch((err, message) => {
                console.error('failed to update schema assignment:', message);
                return err;
            })
    }

    const removeAssignment = async (payload) => {
        console.log("removing assignment for", payload)
        const { item } = payload;
        let deleteId = item.assignmentId;
        
        updateViewSchema(draft => {
            let index = viewSchema.assignments.findIndex(ass => {
                return ass.id === item.assignmentId;
            })
            draft.assignments.splice(index, 1)
            
        })
        
        return await fetch('/api/ensembles/deleteSchemaAssignment', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: item.assignmentId
            })
        })
            .then(response => response.json())
            .then(record => {
                console.log(record)
                return record;
            })
            .catch((err, message) => {
                console.error('failed to remove assignment:', message);
                return err;
            })
    }

    const hoverStyle = {
        ['--drop-h']: 150,
        ['--drop-s']: '60%',
        ['--drop-l']: '45%'
    }

    const rosterStyles = {
        padding: "5px 0",
        margin: "30px 0 0 10px",
        display: "flex"
    }

    const rosterGenerator = (source, filterFunction, div) => {
        switch (source) {
            case "membership":
                return membership.map((mem, m) => {
                    if (filterFunction && filterFunction(mem)) {
                        return null;
                    }
                    return (
                        <MemberCard
                            key={m}
                            member={mem.member}
                            format="drag"
                            cardType="CARD-OUT"
                        />
                    )
                });
            case "assignments":
                return viewSchema?.assignments.map((ass, m) => {
                    if (filterFunction && filterFunction(ass)) {
                        return null;
                    }
                    return (
                        <MemberCard
                            key={m}
                            member={{ ...ass.member, assignmentId: ass.id, capacity: "Performer", assignmentTempId: `${ass.member.id}-${ass.divisionId}` }}
                            subtitle={ass.division?.name}
                            presentation="grid"
                            format={ass.id ? "drag" : "wait"}
                            cardType="CARD-IN"
                        />
                    )
                })
            default:
                return null;
        }
    }
    
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <VForm id="ensembleName" APIURL="/ensembles/updateThisEnsemble" recordId={ensemble.id}>
                        <V.Text id="name" field="name" value={ensemble.name} hero isRequired />
                    </VForm>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <TabControl type="large" >
                        <Tab id="Main">

                        </Tab>
                        <Tab id="Events" >

                        </Tab>
                        <Tab id="Schemas">
                            <V.Select id="schema-select" field="schema" value={ensemble.schema[0].id} options={ensemble.schema} updateForm={(v) => console.log(v.schema) } />
                            <TabControl type="filters">
                                <Tab id="Performer">
                                    {
                                        divisions.map((div, i) => {
                                            if (div.capacity != "Performer") return null;
                                            return (
                                                <DropContainer key={i} onDrop={handleDrop} acceptTypes={["CARD-IN", "CARD-OUT"]}>
                                                    <fieldset className="grid">
                                                        <legend>{div.name}</legend>
                                                        {
                                                            rosterGenerator("assignments", (ass) => ass.division.parentId != div.id, div)
                                                            // viewSchema?.assignments.map((assignment, a) => {
                                                            //     if (assignment.division.parentId != div.id) return null;
                                                            //     return (
                                                            //         <MemberCard
                                                            //             key={a}
                                                            //             member={{ ...assignment.member, assignmentId: assignment.id, capacity: "Performer" }}
                                                            //             subtitle={assignment.division?.name}
                                                            //             presentation="grid"
                                                            //             cardType="CARD-IN"
                                                            //             format="drag"
                                                            //         />
                                                            //     )
                                                            // })
                                                        }
                                                    </fieldset>
                                                    {
                                                        div.childDivisions.map((sd, k) => {
                                                            const dropValue = {
                                                                capacity: "Performer",
                                                                divisionId: sd.id
                                                            }
                                                            return <DropContainer key={k} caption={sd.name}  value={sd} onDrop={handleDrop} hoverStyle={hoverStyle} />
                                                        })
                                                    }
                                                </DropContainer>
                                            )
                                        })
                                    }
                                </Tab>
                                <Tab id="Crew">
                                    <DropContainer acceptTypes={["CARD-IN", "CARD-OUT"]}>
                                        <fieldset className="grid">
                                            <legend>Personnel</legend>
                                            {
                                                membership.map((mem, i) => {
                                                    if (mem.capacity != "Crew") return null;
                                                    return (
                                                        <MemberCard
                                                            key={i}
                                                            member={{ ...mem.member, membershipId: mem.id, capacity: "Crew" }}
                                                            subtitle={mem.title}
                                                            presentation="grid"
                                                            cardType="CARD-IN"
                                                            format="drag"
                                                        />
                                                    )
                                                })
                                            }
                                        </fieldset>
                                        <DropContainer caption="Crew" value={{capacity: "Crew"}} onDrop={handleDrop} hoverStyle={hoverStyle}/>
                                    </DropContainer>
                                </Tab>
                                <Tab id="Staff">
                                    <DropContainer acceptTypes={["CARD-IN", "CARD-OUT"]}>
                                        <fieldset className="grid">
                                            <legend>Personnel</legend>
                                            {
                                                membership.map((mem, i) => {
                                                    if (mem.capacity != "Staff") return null;
                                                    return (
                                                        <MemberCard
                                                            key={i}
                                                            member={{ ...mem.member, membershipId: mem.id, capacity: "Staff" }}
                                                            subtitle={mem.title}
                                                            presentation="grid"
                                                            cardType="CARD-IN"
                                                            format="drag"
                                                        />
                                                    )
                                                })
                                            }
                                        </fieldset>
                                        <DropContainer caption="Staff" value={{capacity: "Staff"}} onDrop={handleDrop} hoverStyle={hoverStyle}/>
                                    </DropContainer>
                                </Tab>
                            </TabControl>
                            <div id="full-roster" className="collapsible" style={{ ...rosterStyles, width: showRoster ? "250px" : "0px" }}>
                                <fieldset>
                                <legend>Members</legend>
                                    <TabControl type="filters">
                                        <Tab id="Unassigned">
                                            <DropContainer acceptTypes={["CARD-IN"]}>
                                                <article>
                                                    {
                                                        rosterGenerator("membership", (mem) => viewSchema?.assignments.find(assignment => assignment.memberId === mem.memberId))
                                                    }
                                                </article>
                                                <DropContainer caption="Remove Assignment" onDrop={removeAssignment} hoverStyle={{border: '2px solid red', backgroundColor: 'hsla(0, 0%, 100%, 50%)', color: 'red'}}/>
                                            </DropContainer>
                                        </Tab>
                                        <Tab id="All">
                                            <DropContainer acceptTypes={["CARD-IN"]}>
                                                <article>
                                                    {
                                                        rosterGenerator("membership")
                                                    }
                                                </article>
                                                <DropContainer caption="Remove Assignment" onDrop={removeAssignment} hoverStyle={{border: '2px solid red', backgroundColor: 'hsla(0, 0%, 100%, 50%)', color: 'red'}}/>
                                            </DropContainer>
                                        </Tab>
                                    </TabControl>
                                </fieldset>
                            </div >
                        </Tab>
                    </TabControl>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <Link href="/ensembles"><button className="icon-and-label"><i>arrow_back</i>Back to Ensembles</button></Link>
                <button className="icon-and-label" onClick={() => setShowRoster(!showRoster)}><i>reduce_capacity</i>Manage Members</button>
            </div>
        </div>

    )
    
}

export default ensembleProfile;