import { useState, useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';
import useModal from '../../hooks/useModal';

import Link from 'next/link';

import V from '../../components/Vcontrols/VerdantControl';
import MemberCard from '../../components/MemberCard';
import TabControl, { Tab } from '../../components/TabControl';
import DropContainer from '../../components/DropContainer';
import FilterList from '../../components/FilterList';

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

const EnsembleProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    
    const [ensemble, updateEnsemble] = useImmer(initialProps.ensemble);
    // const [viewSchema, updateViewSchema] = useImmer(initialProps.baseSchema)
    const [viewSchema, setViewSchema] = useState(initialProps.baseSchema)
    const [schemaAssignments, setSchemaAssignments] = useState(initialProps.baseSchema.assignments)
    const [showRoster, setShowRoster] = useState(false);
    const [tabRoute, setTabRoute] = useState();

    const router = useRouter();

    useEffect(() => {
        console.log("viewSchema has been updated!")
        setSchemaAssignments(viewSchema.assignments)
    }, [viewSchema])

    // useLoader(ensemble.id, updateEnsemble, `/api/ensembles/getOneEnsemble?id=${ensemble.id}`);
    // useLoader(viewSchema?.id, setViewSchema, `/api/ensembles/getOneSchema?id=${viewSchema?.id}`)

    const { divisions } = initialProps;
    const { name, membership, typeId } = ensemble;

    console.log({ ensemble }, { membership }, { divisions }, { viewSchema });
    console.log("rendering with assignments:", {schemaAssignments});

    const loadSchema = async (schemaId) => {
        console.log(schemaId)
        const fetchedSchema = await fetch(`/api/ensembles/getOneSchema?id=${schemaId}`)
        const loadedSchema = await fetchedSchema.json();
        setViewSchema(loadedSchema)
    }

    const newSchemaModal = () => {
        const submitModal = (newSchema) => {
            dispatch({
                route: "modal",
                payload: {
                    mode: "hide"
                }
            })
        }

        const modalBody = 
            <V.Form id="create-schema-form" APIURL="/ensembles/createSchema" additionalIds={{ ensembleId: ensemble.id }} followUp={submitModal}>
                <V.Text id="schema-name" field="name" label="New Schema Name" />
                <section className="modal-buttons">
                    <button name="submit">Submit</button>
                    <button name="cancel">Cancel</button>
                </section>
            </V.Form>
            
        
        dispatch({
            route: "modal",
            payload: {
                mode: "form",
                content: {
                    title: "Create New Schema",
                    body: modalBody
                }
            }
        })
    }

    const copySchemaModal = () => {
        const submitModal = (newSchema) => {
            dispatch({
                route: "modal",
                payload: {
                    mode: "hide"
                }
            })
        }

        const modalBody = <V.Text id="schema-name" field="name" label="New Schema Name" />
            
        
        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Copy Schema",
                    body: modalBody,
                    URL: "/ensembles/copySchema",
                    additionalIds: {ensembleId: ensemble.id, schemaId: viewSchema.id}
                },
                buttons: [
                    { name: "submit", caption: "Copy Schema", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
    }

    const uploadMembersModal = () => {
        const submitModal = (submission) => {
            console.log({ submission });
            dispatch({
                route: "modal",
                payload: {
                    mode: "hide"
                }
            })
        }

        const modalBody = 
            <V.Form id="upload-members-form" additionalIds={{ensembleId: ensemble.id}} APIURL="/members/uploadMembers" followUp={submitModal} debug >
                <section className="modal-fields">
                    <V.File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                </section>
                <section className="modal-buttons">
                    <button name="submit">Submit</button>
                    <button name="cancel">Cancel</button>
                </section>
            </V.Form>
        
        dispatch({
            route: "modal",
            payload: {
                mode: "form",
                content: {
                    title: "Upload Members from Excel File",
                    body: modalBody,
                }
            }
        })
    }

    const handleDrop = async (payload) => {
        console.log({payload})
        if (!payload.division) return null;
        const { membership, division } = payload;

        const newAssignments = [...schemaAssignments]
        if (membership.assignmentId) {
            const assIndex = newAssignments.findIndex(ass => {
                return `${ass.membership.id}-${ass.schemaId}-${ass.divisionId}` === membership.assignmentId;
            })
            if (assIndex < 0) return null;

            if (division.id === "remove") {
                newAssignments.splice(assIndex, 1);
            } else {
                newAssignments[assIndex] = { ...newAssignments[assIndex], assignmentId: `${membership.id}-${viewSchema.id}-${division.id}`, divisionId: division.id, division: division }
            }
            
        } else {
            newAssignments.push({ assignmentId: `${membership.id}-${viewSchema.id}-${division.id}`, schemaId: viewSchema.id, membership: membership, memberId: membership.memberId, capacity: division.capacity, divisionId: division.id, division: division });
        }

        setSchemaAssignments(newAssignments);

        if (division.id === "remove") {

            return await fetch('/api/ensembles/deleteSchemaAssignment', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    membershipId: membership.id,
                    schemaId: viewSchema.id,
                    divisionId: membership.divisionId
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
        } else {

            return await fetch('/api/ensembles/updateSchemaAssignment', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    membershipId: membership.id,
                    schemaId: viewSchema.id,
                    capacity: division.capacity,
                    divisionId: division.id
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
        canDropStyle: { height: "100px" },
        hoverStyle: {
            ['--drop-h']: 0,
            ['--drop-s']: '100%',
            ['--drop-l']: '45%'
        },
    }

    const rosterStyles = {
        display: "flex",
        flex: 1
    }

    const rosterGenerator = (source, filterFunction, div) => {
        // console.log("running roster Generator:", source, )
        switch (source) {
            case "membership":
                return membership.map((mem, m) => {
                    if (filterFunction && filterFunction(mem)) {
                        return null;
                    }
                    return (
                        <MemberCard
                            key={m}
                            membership={mem}
                            format="drag"
                            cardType="CARD-OUT"
                            dropAction={handleDrop}
                        />
                    )
                });
            case "assignments":
                return schemaAssignments?.map((ass, m) => {//return viewSchema?.assignments.map((ass, m) => {
                    if (filterFunction && filterFunction(ass)) {
                        return null;
                    }
                    return (
                        <MemberCard
                            key={m}
                            membership={{ ...ass.membership, assignmentId: `${ass.membership.id}-${viewSchema.id}-${ass.division.id}`, capacity: "Performer", divisionId: ass.divisionId }}
                            subtitle={ass.division?.name}
                            presentation="grid"
                            format="drag"
                            cardType="CARD-IN"
                            dropAction={handleDrop}
                        />
                    )
                })
            default:
                return null;
        }
    }

    const rosterFilters = [
        {
            name: "Unassigned",
            method: (item) => viewSchema?.assignments.find(assignment => assignment.membership.memberId === meitemm.memberId)
        },
        {
            name: "All",
            method: (item) => item
        }
    ]

    const memberRosterBox = 
        <div id="full-roster" className="collapsible" style={{ ...rosterStyles, maxWidth: showRoster ? "250px" : "0px" }}>
            <fieldset>
            <legend>Members</legend>
                <TabControl type="filters">
                    <Tab id="Unassigned">
                        <article>
                            <DropContainer caption="Remove Assignment" value={{id: "remove"}} acceptTypes={["CARD-IN"]} dropStyles={removeSectionDropStyle} />
                            {
                                rosterGenerator("membership", (mem) => schemaAssignments?.find(assignment => assignment.membership.memberId === mem.memberId))
                            }
                        </article>
                    </Tab>
                    <Tab id="All">
                        <article>
                            <DropContainer caption="Remove Assignment" value={{id: "remove"}} acceptTypes={["CARD-IN"]} dropStyles={removeSectionDropStyle} />
                            {
                                rosterGenerator("membership")
                            }
                        </article>
                    </Tab>
                </TabControl>
                {/* <FilterList
                    listSet={{membership: membership}}
                    Elem={MemberCard}
                    filters={rosterFilters}
                    search={true}
                /> */}
            </fieldset>
        </div >
    
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <V.Form id="ensembleName" APIURL="/ensembles/updateThisEnsemble" recordId={ensemble.id}>
                        <V.Text id="name" field="name" value={ensemble.name} hero isRequired />
                    </V.Form>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <TabControl type="large" onChange={(tab) => setTabRoute(tab)}>
                        <Tab id="Main" onLoad={() => console.log("loading Main")} >

                        </Tab>
                        <Tab id="Events" onLoad={() => console.log("loading Events")} >

                        </Tab>
                        <Tab id="Schemas" direction="vert">
                            <V.Select id="schema-select" field="schema" value={ensemble.schema[0].id} options={ensemble.schema} extraAction={(schema) => loadSchema(schema[0].id)} />
                            <TabControl type="filters">
                                <Tab id="Performer">
                                    {
                                        divisions.map((div, d) => {
                                            if (div.capacity != "Performer") return null;
                                            return (
                                                <fieldset key={d} className="card-set" style={{position: "relative"}} >
                                                    <legend>{div.name}</legend>
                                                    {
                                                        div.childDivisions.map((sd, c) => {
                                                            return <DropContainer key={c} caption={sd.name} value={sd} acceptTypes={["CARD-IN", "CARD-OUT"]} dropStyles={sectionDropStyle} />
                                                        })
                                                    }
                                                    {
                                                        rosterGenerator("assignments", (ass) => ass.division.parentId != div.id, div)
                                                    }
                                                    
                                                </fieldset>
                                            )
                                        })
                                    }
                                    {memberRosterBox}
                                </Tab>
                                <Tab id="Crew">
                                    {
                                        divisions.map((div, d) => {
                                            if (div.capacity != "Crew") return null;
                                            return (
                                                <fieldset key={d} className="card-set">
                                                    <legend>Personnel</legend>
                                                    {
                                                        div.childDivisions.map((sd, c) => {
                                                            return <DropContainer key={c} caption={sd.name} value={sd} acceptTypes={["CARD-IN", "CARD-OUT"]} dropStyles={sectionDropStyle} />
                                                        })
                                                    }
                                                    {
                                                        rosterGenerator("assignments", (ass) => ass.capacity != "Crew")
                                                    }
                                                </fieldset>
                                            )
                                        })
                                    }
                                    {memberRosterBox}
                                </Tab>
                                <Tab id="Staff">
                                    {
                                        divisions.map((div, d) => {
                                            if (div.capacity != "Staff") return null;
                                            return (
                                                <fieldset key={d} className="card-set">
                                                    <legend>Personnel</legend>
                                                    {
                                                        div.childDivisions.length ? 
                                                        div.childDivisions.map((sd, c) => {
                                                            return <DropContainer key={c} caption={sd.name} value={sd} acceptTypes={["CARD-IN", "CARD-OUT"]} dropStyles={sectionDropStyle} />
                                                        }) :
                                                        <DropContainer key="x" caption="Staff" value={div} acceptTypes={["CARD-IN", "CARD-OUT"]} dropStyles={sectionDropStyle} />
                                                    }
                                                    {
                                                        rosterGenerator("assignments", (ass) => ass.capacity != "Staff")
                                                    }
                                                </fieldset>
                                            )
                                        })
                                    }
                                    {memberRosterBox}
                                </Tab>
                            </TabControl>
                        </Tab>
                    </TabControl>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <button className="icon-and-label" onClick={() => router.push("/ensembles")}><i>arrow_back</i>Back to Ensembles</button>
                <button className="icon-and-label" onClick={uploadMembersModal}><i>upload</i>Upload Members</button>
                {tabRoute === 2 &&
                    <fieldset className="buttons">
                        <legend>Schema</legend>
                        <button className="icon-and-label" onClick={() => setShowRoster(!showRoster)}><i>reduce_capacity</i>Manage Members</button>
                        <button className="icon-and-label" onClick={newSchemaModal}><i>add_box</i>New Schema</button>
                        <button className="icon-and-label" onClick={copySchemaModal}><i>library_add</i>Copy Schema</button>
                    </fieldset>
                }
            </div>
        </div>

    )
    
}

export default EnsembleProfile;