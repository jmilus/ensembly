import { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';
import { useDrop } from 'react-dnd';

import { ItemTypes } from '../../config/constants';

import Link from 'next/link';
import Meta from '../../components/Meta';

import VForm from '../../components/VForm';
import V from '../../components/ControlMaster';
import MemberCard from '../../components/MemberCard';
import TabControl, { Tab } from '../../components/TabControl';
import DropContainer from '../../components/DropContainer';

import { GlobalContext } from "../_app";

import getThisEnsemble from '../../lib/ensembles/_fetchThisEnsemble';

import basePageStyles from '../../styles/basePage.module.css';
import getAllDivisions from '../../lib/ensembles/_fetchAllDivisions';
import getAllSubdivisions from '../../lib/ensembles/_fetchAllSubdivisions';
import getAllMembers from '../../lib/members/_fetchAllMembers';

import { Capacity } from '@prisma/client';

export async function getServerSideProps(context) {
    const ensemble = await getThisEnsemble(context.params.id);
    const members = await getAllMembers();
    const divisions = await getAllDivisions(ensemble.typeId);
    const subdivisions = await getAllSubdivisions();

    // console.log("sending these to the API:", context.params);
    
    return {
        props: {
            ensemble,
            members,
            divisions,
            subdivisions
        }
    }
}

const ensembleProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    
    const [ensemble, setEnsemble] = useState(initialProps.ensemble);
    const [showRoster, setShowRoster] = useState(false);
    const router = useRouter();

    useLoader(ensemble.id, setEnsemble, `/api/ensembles/fetchThisEnsemble?id=${ensemble.id}`);

    const { members, divisions, subdivisions } = initialProps;
    const { name, membership, typeId } = ensemble;

    console.log({ensemble}, {members}, {divisions}, {subdivisions});

    const ensembleCapacities = {};
    membership.forEach(mem => {
        ensembleCapacities[mem.capacity] = mem.capacity;
    })

    const handleDrop = async (payload) => {
        if (payload.tag != "subDivisionId") return null;
        //
        console.log({payload})
        const { item, tag, value } = payload;
        const changedIndex = ensemble.membership.findIndex(mem => {
            return item.membershipId === mem.id;
        })
        const tempEnsemble = {...ensemble}
        if (changedIndex >= 0) {
            tempEnsemble.membership[changedIndex].subDivisionId = value.id;
            tempEnsemble.membership[changedIndex].subDivision = value;
            tempEnsemble.membership[changedIndex].divisionId = value.divisionId;
            tempEnsemble.membership[changedIndex].division = divisions.find((div) => div.id === value.divisionId);
        } else {
            tempEnsemble.membership.push({
                member: {...item, memberId: item.id},
                capacity: item.capacity,
                subDivisionId: value.id,
                subDivision: value,
                divisionId: value.divisionId,
                division: divisions.find((div) => div.id === value.divisionId)
            })
        }
        setEnsemble(tempEnsemble);


        const updatedMembership = await fetch('/api/members/updateMembership', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: item.membershipId,
                ensembleId: ensemble.id,
                capacity: item.capacity,
                linkedId: item.id,
                division: value.divisionId,
                subdivision: value.id
            })
        })
            .then(response => response.json())
            .then(record => {
                console.log(record)
                return record;
            })
            .catch((err, message) => {
                console.error('failed to update membership:', message);
                return err;
            })
        return updatedMembership;
    }

    
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <VForm id="ensembleName" APIURL="/ensembles/updateThisEnsemble" recordId={ensemble.id}>
                        <V.Text id="name" name="name" value={ensemble.name} hero isRequired />
                    </VForm>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <TabControl>
                        {
                            Object.keys(Capacity).map(cap => {
                                return (
                                    <Tab id={cap}>
                                        {
                                            divisions.map(div => {
                                                if (div.capacity != cap) return null;
                                                return (
                                                    <fieldset>
                                                        <legend>{div.name}</legend>
                                                        <DropContainer tag="divisionId" value={div} onDrop={handleDrop}>
                                                            {
                                                                membership.map((mem, i) => {
                                                                    if (mem.divisionId != div.id) return null;
                                                                    return (
                                                                        <MemberCard
                                                                            key={i}
                                                                            member={{ ...mem.member, membershipId: mem.id, capacity: cap }}
                                                                            subtitle={mem.subDivision?.name}
                                                                            presentation="grid"
                                                                            format="drag"
                                                                        />
                                                                    )
                                                                })
                                                            }
                                                            {
                                                                subdivisions.map(sd => {
                                                                    if (sd.divisionId != div.id) return null;
                                                                    return <DropContainer tag="subDivisionId" value={sd} onDrop={handleDrop} />
                                                                })
                                                            }
                                                        </DropContainer>
                                                    </fieldset>
                                                )
                                            })
                                        }
                                    </Tab>
                                )
                            })
                        }
                        
                    </TabControl>
                    <div id="full-roster" className="collapsible" style={{ width: showRoster ? "250px" : "0px" }}>
                        <TabControl>
                            <Tab id="Unassigned">
                                <fieldset>
                                    <legend>Members</legend>
                                    <article>
                                        {
                                            members.map((member, i) => {
                                                const result = membership.find(mem => {
                                                    return mem.member.id === member.id;
                                                })
                                                if (result) return null;
                                                return (
                                                    <MemberCard
                                                        key={i}
                                                        member={member}
                                                        format="drag"
                                                    />
                                                )
                                            })
                                        }
                                    </article>
                                </fieldset>
                            </Tab>
                            <Tab id="All">
                                <fieldset>
                                    <legend>Members</legend>
                                    <article>
                                        {
                                            members.map((member, i) => {
                                                return (
                                                    <MemberCard
                                                        key={i}
                                                        member={member}
                                                        format="drag"
                                                    />
                                                )
                                            })
                                        }
                                    </article>
                                </fieldset>
                            </Tab>
                        </TabControl>
                        
                        {/* {
                        } */}
                    </div >
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