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

const ensembleProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    
    const [ensemble, updateEnsemble] = useImmer(initialProps.ensemble);
    const [viewSchema, updateViewSchema] = useImmer(initialProps.baseSchema)
    const [showRoster, setShowRoster] = useState(false);
    const [tabRoute, setTabRoute] = useState("Main");
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

    const newSchemaModal = () => {
        const submitModal = (newSchema) => {

        }

        const modalBody = <V.Text id="schema-name" field="name" label="New Schema Name" />
            
        
        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Schema",
                    body: modalBody,
                    URL: "/ensembles/createSchema",
                    additionalIds: {ensembleId: ensemble.id}
                },
                buttons: [
                    { name: "submit", caption: "Create Schema", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
    }

    const copySchemaModal = () => {
        const submitModal = (newSchema) => {

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
            console.log({submission});
        }

        const modalBody = 
            <section className="modal-fields">
                <V.File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
            </section>
        
        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Upload Members from Excel File",
                    body: modalBody,
                    URL: "/members/uploadMembers",
                    file: true,
                    context: {ensembleId: ensemble.id}
                },
                buttons: [
                    { name: "submit", caption: "Upload Members", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
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
                    draft.assignments.push({ schemaId: viewSchema.id, membership: item, memberId: item.memberId, capacity: value.capacity, divisionId: value.id, division: value, assignmentTempId: `${item.id}-${value.id}` });
                }
            }

        })

        return await fetch('/api/ensembles/updateSchemaAssignment', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: item.assignmentId,
                schemaId: viewSchema.id,
                membershipId: item.id,
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
        display: "flex",
        flex: 1
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
                            membership={mem}
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
                            membership={{ ...ass.membership, assignmentId: ass.id, capacity: "Performer", assignmentTempId: `${ass.membership.memberId}-${ass.divisionId}` }}
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
        <div id="full-roster" className="collapsible" style={{ ...rosterStyles, minWidth: showRoster ? "250px" : "0px" }}>
            <fieldset>
            <legend>Members</legend>
                <TabControl type="filters">
                    <Tab id="Unassigned">
                        <DropContainer acceptTypes={["CARD-IN"]}>
                            <article>
                                {
                                    rosterGenerator("membership", (mem) => viewSchema?.assignments.find(assignment => assignment.membership.memberId === mem.memberId))
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
                    <VForm id="ensembleName" APIURL="/ensembles/updateThisEnsemble" recordId={ensemble.id}>
                        <V.Text id="name" field="name" value={ensemble.name} hero isRequired />
                    </VForm>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <TabControl type="large" >
                        <Tab id="Main" onTabLoad={() => setTabRoute("Main")}>

                        </Tab>
                        <Tab id="Events" onTabLoad={() => setTabRoute("Events")}>

                        </Tab>
                        <Tab id="Schemas" onTabLoad={() => setTabRoute("Schemas")} direction="vert">
                            <V.Select id="schema-select" field="schema" initialValue={ensemble.schema[0].id} options={ensemble.schema} updateForm={(v) => loadSchema(v.schema) } />
                            <TabControl type="filters">
                                <Tab id="Performer">
                                    {
                                        divisions.map((div, d) => {
                                            if (div.capacity != "Performer") return null;
                                            return (
                                                <DropContainer key={d} onDrop={handleDrop} acceptTypes={["CARD-IN", "CARD-OUT"]}>
                                                    <fieldset className="card-set">
                                                        <legend>{div.name}</legend>
                                                        {
                                                            rosterGenerator("assignments", (ass) => ass.division.parentId != div.id, div)
                                                        }
                                                    </fieldset>
                                                    {
                                                        div.childDivisions.map((sd, c) => {
                                                            return <DropContainer key={c} caption={sd.name}  value={sd} onDrop={handleDrop} hoverStyle={hoverStyle} />
                                                        })
                                                    }
                                                </DropContainer>
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
                                                <DropContainer key={d} acceptTypes={["CARD-IN", "CARD-OUT"]}>
                                                    <fieldset className="card-set">
                                                        <legend>Personnel</legend>
                                                        {
                                                            rosterGenerator("assignments", (ass) => ass.capacity != "Crew")
                                                        }
                                                    </fieldset>
                                                    {
                                                        div.childDivisions.map((sd, c) => {
                                                            return <DropContainer key={c} caption={sd.name} value={sd} onDrop={handleDrop} hoverStyle={hoverStyle}/>
                                                        })
                                                    }
                                                </DropContainer>
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
                                                <DropContainer key={d} acceptTypes={["CARD-IN", "CARD-OUT"]}>
                                                    <fieldset className="card-set">
                                                        <legend>Personnel</legend>
                                                        {
                                                            rosterGenerator("assignments", (ass) => ass.capacity != "Staff")
                                                        }
                                                    </fieldset>
                                                    {
                                                        div.childDivisions.length ? 
                                                        div.childDivisions.map((sd, c) => {
                                                            return <DropContainer key={c} caption={sd.name} value={sd} onDrop={handleDrop} hoverStyle={hoverStyle}/>
                                                        }) :
                                                        <DropContainer key="x" caption="Staff" value={div} onDrop={handleDrop} hoverStyle={hoverStyle}/>
                                                    }
                                                </DropContainer>
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
                <Link href="/ensembles"><button className="icon-and-label"><i>arrow_back</i>Back to Ensembles</button></Link>
                <button className="icon-and-label" onClick={uploadMembersModal}><i>upload</i>Upload Members</button>
                {tabRoute === "Schemas" && 
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

export default ensembleProfile;