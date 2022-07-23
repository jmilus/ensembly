import { useEffect, useState, useContext, useRef } from 'react';
import useAutoSaveForm from '../../hooks/useAutoSaveForm';
import { useRouter } from 'next/router';

import Carousel from '../../components/Carousel';
import ContactCard from '../../components/ContactCard';
import DateControl from '../../components/DateControl';
import Link from 'next/link';
import SelectControl from '../../components/SelectControl';
import TextControl from '../../components/TextControl';

import { GlobalContext } from "../_app";
import { deleteRecord, handleFormUpdate } from '../../utils/';
import getAllEnsembles from '../../lib/ensembles/_fetchAllEnsembles';
import getThisEnsemble from '../../lib/ensembles/_fetchThisEnsemble';

import styles from '../../styles/ensembleProfile.module.css';
import { isEmpty } from 'lodash';

export async function getStaticProps({ params }) {
    const ensembleFormData = await getThisEnsemble(params.id);
    const { ensemble, properties } = ensembleFormData;
    return {
        props: {
            ensemble: ensemble ? ensemble : {},
            properties: properties ? properties : {}
        }
    }
}

export async function getStaticPaths() {
    const ensembles = await getAllEnsembles();
    const paths = ensembles.map((ensemble) => {
        return {
            params: {
                id: ensemble.id.toString(),
            }
        }
    })
    return {
        paths,
        fallback: true
    }
}

const ensembleProfile = (initialProps) => {
    const router = useRouter();
    const [ensemble, setEnsemble] = useState(initialProps.ensemble);
    const [saved, setSaved] = useState(true);
    const saveTimer = useRef(null);

    const { autoSaveDelay } = useAutoSaveForm();

    const id = router.query.id;

    const loadEnsembleProfile = async (ensemble) => {
        const response = await fetch(`/api/ensembles/fetchThisEnsemble?id=${ensemble.id}`);
        if (!response.ok) throw new Error(response.statusText);
        const profile = await response.json();
        setEnsemble(profile);
    }

    useEffect(() => {
        if (isEmpty(initialProps.ensemble)) {
            if (ensembles.length > 0) {
                const findEnsembleById = ensembles.find(ensemble => {
                    return ensemble.id.toString() === id;
                })
                loadEnsembleProfile(findEnsembleById);
            }
        }

    }, [id]);

    const updateEnsembleProfile = async (event) => {
        const APIURL = '/api/ensembles/updateThisEnsemble';
        const ids = { recordId: ensemble.id, linkedId: null };
        const updatedEnsemble = await handleFormUpdate(event, APIURL, ids)

        setEnsemble(updatedEnsemble);
        setSaved(true);
    }

    

    // console.log("rendering with", ensemble);
    const { name, members, typeId } = ensemble;
    console.log({ensemble});
    console.log( initialProps.properties );
    return (
        <div className={styles.profilePage}>
            <div className={styles.dataSection}>
                <div className={styles.profileHeader}>
                    <form id="ensembleName" name="ensembleName" onSubmit={(e) => updateEnsembleProfile(e)} onChange={(e) => autoSaveDelay(e)}>
                        <TextControl id="name" name="name" type="text" initialValue={name} hero isRequired/>
                    </form>
                </div>
                <div className={styles.profileDetails}>
                    <div className={styles.profileSegment}>
                        <form id="profile" name="profile" onSubmit={(e) => updateEnsembleProfile(e)} onChange={(e) => autoSaveDelay(e)}>
                            <fieldset>
                                <legend>Ensemble Details</legend>
                                <SelectControl id="type" name="type" label="Ensemble Type" initialValueId={typeId} options={initialProps.properties} optionValue="typeName"/>
                                
                            </fieldset>
                        </form>
                    </div>
                    <div className={styles.profileSegmentWide}>
                        <fieldset>
                            <legend>Membership</legend>
                        </fieldset>
                    </div>
                </div>
            </div>
            <div className={styles.actionSection}>
                <Link href="/ensembles"><button className="icon-and-label"><i>arrow_back</i>Back to Ensembles</button></Link>
                <button type="submit" className="" onClick={() => document.forms["profile"].requestSubmit()}>Save</button>
            </div>
        </div>

    )
    
}

export default ensembleProfile;