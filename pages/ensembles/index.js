import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';

import Meta from '../../components/Meta';
import EnsembleCard from '../../components/EnsembleCard';

import { ACTION_TYPES, GlobalContext } from "../_app";

import style from '../../styles/ensembles.module.css';

export default function ensemblesPage(props) {
    const { dispatch, state } = useContext(GlobalContext);
    const { ensembles } = state;
    const router = useRouter();

    useEffect(() => {
        async function fetchEnsembles() {
            const response = await fetch('/api/ensembles/fetchAllEnsembles');
            if (!response.ok) throw new Error(response.statusText);
            const ensembleList = await response.json()
            try {
                dispatch({
                    type: ACTION_TYPES.SET_ENSEMBLELIST,
                    payload: {
                        ensembles: ensembleList
                    }
                })
            }
            catch (error) {
                //set error
                console.log("this is the error", { error })
            }
        }
        // async function fetchEnsembleTypes() {
        //     const response = await fetch('/api/ensembles/fetchAllEnsembleTypes');
        //     if (!response.ok) throw new Error(response.statusText);
        //     const ensembleTypeList = await response.json()
        //     try {
        //         dispatch({
        //             type: ACTION_TYPES.SET_ENSEMBLETYPELIST,
        //             payload: {
        //                 ensembleTypes: ensembleTypeList
        //             }
        //         })
        //     }
        //     catch (error) {
        //         //set error
        //         console.log("this is the error", { error })
        //     }
        // }
        fetchEnsembles();
    }, []);

    const createEnsemble = async (formData) => {
        
        dispatch({
            type: ACTION_TYPES.LOAD_MODAL
        })
        try {
            const newEnsemble = await fetch('/api/ensembles/createNewEnsemble', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(ensemble => {
                return ensemble;
            })
            .catch((err) => {
                console.error('Could not create new ensemble...', err);
            })
            if (newEnsemble.err) throw new Error(newEnsemble.message);

            dispatch({
                type: ACTION_TYPES.HIDE_MODAL
            })

            console.log({ newEnsemble });

            ensembles.push(newEnsemble);
            dispatch({
                type: ACTION_TYPES.SET_ENSEMBLELIST,
                payload: {
                    ensembles: ensembles
                }
            })

            router.push(`/ensembles/${newEnsemble.id}`)
        }
        catch (error) {
            dispatch({
                type: ACTION_TYPES.SET_MODAL,
                payload: {
                    modal: {
                        type: "error",
                        message: error.message
                    }
                }
            })
            console.error({ error });
        }

    }
    
    const newEnsembleModal = async () => {
        console.log("create new ensemble");
        const ensembleTypeList = await fetch('/api/ensembles/fetchAllEnsembleTypes')
            .then(res => res.json())
            .then(response => {
                console.log(response);
                return response;
            })
            .catch(err => {
                console.log("something went wrong:", err.message);
            })

        const modalContent = {
            type: "form",
            submit: createEnsemble,
            title: "Create New Ensemble",
            fields: [
                { id: "name", name: "name", type: "text", label: "Ensemble Name", controlType: "text"},
                { id: "type", name: "type", type: "select", label: "Ensemble Type", controlType: "select", options: ensembleTypeList}
            ],
            actions: []
        }
        dispatch({
            type: ACTION_TYPES.SET_MODAL,
            payload: {
                modal: modalContent
            }
        })
    }

    let ensemblesGrid = null;
    if (ensembles) {
        console.log({ ensembles });
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
            <div className="module-page">
                <div className="page-header">
                    <div className="page-controls">
                        <input type="text" placeholder="Search..." />
                        <button className="icon-and-label" onClick={() => newEnsembleModal()}>Add</button>
                    </div>
                </div>
                <div className="page-body">
                    <div className={style.cardGrid}>
                        {
                            ensemblesGrid
                        }
                    </div>
                </div>
            </div>
        </>
    )
}