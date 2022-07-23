import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getInitials, handleFormUpdate } from '../utils';
import DateControl from './DateControl';
import SelectControl from './SelectControl';

import useAutoSaveForm from '../hooks/useAutoSaveForm';

import { Status, Role } from '@prisma/client';

import styles from '../styles/ProfileCard.module.css'

const getSections = async (ensembleTypeId) => {
    const sections = await fetch('/api/ensembles/fetchAllSections', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            ensembleTypeId: ensembleTypeId
        })
    })
        .then(res => res.json())
        .then(sections => {
            //console.log("returned sections:", sections);
            return sections
        })
        .catch((err) => {
            console.log("failed to fetch ensemble sections,", err);
        })
    
    return sections;
}

const EnsembleCard = ({ ensemble, memberId, presentation, format }) => {
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState();
    const router = useRouter();
    const { autoSaveDelay } = useAutoSaveForm();

    const { ensembleId, membershipId, ensembleName, roles } = ensemble;
    
    const initials = getInitials([ensembleName]).substring(0,3);
    const heroIcon = <div>{initials}</div>
    
    useEffect(() => {
        async function fetchSections() {
            const fetchedSections = await getSections(ensemble.ensembleType.id)
            setSections(fetchedSections);
            setFilteredSections(filterSections(role))
        }
        if (format === "detail") {
            fetchSections();
        }
    }, [format])
    
    // console.log({ ensemble }, { sections })
    
    const filterSections = (role) => {
        const filtered = sections.filter(sec => {
            return sec.roleType === role.name
        })
        setFilteredSections(filtered)
    }

    const updateMembership = async (event) => {
        const APIURL = '/api/members/updateMembership';
        const ids = {
            recordId: ensemble.membershipId,
            linkedId: memberId
        }
        try {
            await handleFormUpdate(event, APIURL, ids);
        }
        catch {
            console.log("there was a problem updating this membership");
        }

    }

    switch (format) {
        case "detail":
            return (
                <object className={styles.cardContainer}>
                    <div className={styles.title} onClick={() => router.push(`/ensembles/${ensembleId}`)}>
                        <div className={styles.heroIcon} style={{ width: "25px", height: "25px", fontSize: "0.5em"}}>{heroIcon}</div>
                        <div className={styles.cardName}>{ensembleName}</div>
                    </div>
                    {
                        roles.map((role, i) => {
                            const formName = `membership-${ensembleId}-${membershipId}`;
                            return (
                                <form id={formName} name={formName} onSubmit={(e) => updateMembership(e)} onChange={(e) => autoSaveDelay(e)}>
                                    <section>
                                        <SelectControl id="role" name="role" label="Role" initialValueId={role.name} options={Role}>
                                            <SelectControl id="section" name="section" label="Section" initialValueId={role.section.id} options={sections} />
                                        </SelectControl>
                                        <DateControl id="startDate" name="startDate" label="Start" initialValue={role.startDate} />
                                        <DateControl id="endDate" name="endDate" label="End" initialValue={role.endDate} />
                                    </section>
                                </form>
                            )
                        })
                    }
                </object>
            )
        case "minimal":
        default:
            return (
                <object className={styles.cardContainer} onClick={() => router.push(`/ensembles/${ensembleId}`)}>
                    <div className={styles.heroIcon} style={{width: "50px", height: "50px"}}>{heroIcon}</div>
                    <div className={styles.cardName}>{ensembleName}</div>
                </object>
            );
    }
}

export default EnsembleCard;