'use client'

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';

import EnsembleCard from '../../components/EnsembleCard';

import {Form, Text, Select} from '../../components/Vcontrols/';

import { GlobalContext } from "../../components/ContextFrame";

import basePageStyles from '../../styles/basePage.module.css';

//

export default function EnsemblesPage(initialProps) {
    const { dispatch } = useContext(GlobalContext);
    const { ensembles } = initialProps;
    const router = useRouter();

    const newEnsembleModal = () => {
        const submitModal = (newRecord) => {
            dispatch({
                route: "modal",
                payload: {
                    type: "hide"
                }
            })
            router.push(`/ensembles/${newRecord[0].id}`)
        }

        const modalBody = 
            <Form id="create-new-ensemble-form" APIURL="/ensembles/createEnsemble" followUp={submitModal} >
                <section className="modal-fields">
                    <Text id="newEnsembleName" field="name" label="Ensemble Name" />
                    <Select id="newEnsembleType" field="typeId" label="Ensemble Type" options={ initialProps.ensembleTypes } />
                </section>
                <section className="modal-buttons">
                    <button name="submit">Create Ensemble</button>
                    <button name="cancel">Cancel</button>
                </section>
            </Form>
        
        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Ensemble",
                    body: modalBody
                }
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
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.actionSection}>
                <article style={{ padding: "10px" }}>
                    <button className="icon-and-label" onClick={() => newEnsembleModal()}><i>add_circle</i>New Ensemble</button>
                
                </article>
            </div>
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
        </div>
    )
}