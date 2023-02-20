import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import {fetchManyEnsembles} from '../api/ensembles/getManyEnsembles';
import {fetchManyEnsembleTypes} from '../api/ensembles/getManyEnsembleTypes';

import Meta from '../../components/Meta';
import EnsembleCard from '../../components/EnsembleCard';

import V from '../../components/Vcontrols/VerdantControl';

import { GlobalContext } from "../_app";

import basePageStyles from '../../styles/basePage.module.css';

export async function getServerSideProps(context) {
    const ensembles = await fetchManyEnsembles();
    const ensembleTypes = await fetchManyEnsembleTypes();

    return {
        props: {
            ensembles,
            ensembleTypes
        }
    }
}

//

export default function EnsemblesPage(initialProps) {
    const { dispatch } = useContext(GlobalContext);
    const [ensembles, setEnsembles] = useState(initialProps.ensembles);
    const router = useRouter();

    useLoader("all-ensembles", setEnsembles, `/api/ensembles/getManyEnsembles`);

    const newEnsembleModal = () => {
        const submitModal = (newRecord) => {
            dispatch({
                type: "modal",
                payload: {
                    type: "hide"
                }
            })
            router.push(`/ensembles/${newRecord[0].id}`)
        }

        const modalBody = 
            <section className="modal-fields">
                <V.Text id="newEnsembleName" field="name" label="Ensemble Name" />
                <V.Select id="newEnsembleType" field="typeId" label="Ensemble Type" options={ initialProps.ensembleTypes } />
            </section>
        
        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Ensemble",
                    body: modalBody,
                    URL: "/ensembles/createEnsemble"
                },
                buttons: [
                    { name: "submit", caption: "Create Ensemble", class: "hero" },
                    { name: "dismiss", caption: "Cancel" }
                ],
                followUp: submitModal
            }
        })
    }

    // console.log({ ensembles })


    let ensemblesGrid = null;
    if (ensembles) {
        // console.log({ ensembles });
        ensemblesGrid = ensembles.map((ensemble, i) => {
            return (
                <EnsembleCard
                    key={i}
                    ensemble={ensemble}
                    presentation="grid"
                    format="minimal"
                />
            )
        })
    }

    return (
        <>
            <Meta title={"Ensembly | Ensembles"} />
            <div className={basePageStyles.pageBase}>
                <div className={basePageStyles.formSection}>
                    <div className={basePageStyles.pageHeader}>
                        <h1>Ensembles</h1>
                    </div>
                    <div className={basePageStyles.pageDetails}>
                        <div className="grid">
                            { ensemblesGrid }
                        </div>
                    </div>
                </div>
                <div className={basePageStyles.actionSection}>
                    <button className="icon-and-label" onClick={() => newEnsembleModal()}><i>add_circle</i>New Ensemble</button>
                </div>
            </div>
        </>
    )
}