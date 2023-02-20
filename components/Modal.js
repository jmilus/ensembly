import React, { Children, useContext, useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/';

import V from '../components/Vcontrols/VerdantControl';

import { GlobalContext } from '../pages/_app';

import styles from '../styles/Modal.module.css'

const Modal = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { modal } = parameters;
    const [modalIsFullscreen, setModalIsFullscreen] = useState(true)
    console.log("rendering modal with:", modal, modalIsFullscreen);

    useEffect(() => {
        setModalIsFullscreen(true)
    }, [modal])

    const hideModal = () => {
        if (modal.mode === "load") {
            console.log("setting fullscreen to false")
            setModalIsFullscreen(false)
        } else {
            dispatch({ route: "modal", payload: null })
        }
    }
    
    let modalBody = null;

    if (modal) {
        if (modal.mode != "hide") {
            const { content } = modal;
            switch (modal.mode) {
                case "load":
                    modalBody =
                        <div className="loading">
                            Loading...
                        </div>
                    break;
                case "error":
                    const errMessage = getErrorMessage(modal.errCode)
                    modalBody =
                        <>
                            <div className={styles.error}>
                                {errMessage}
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className="panel" onClick={hideModal}>OK</button>
                            </div>
                        </>
                    break;
                case "form":
                    modalBody =
                        < >
                            <div className={styles.modalHeader}>{content.title}</div>
                            {content.body}
                        </>
                    break;
                case "message":
                    modalBody = 
                        <>
                            <div className={styles.modalHeader}>{content.title}</div>
                            <div className={styles.modalAlertMessage}>
                                <i>help</i>
                                <div className="modal-message">{content.body}</div>
                            </div>
                        </>
                default:
                    console.log("no modal type specified");
                    break;
            }
            return (
                <div className="modal-base">
                    <div className={`modal-body ${modalIsFullscreen ? "" : "min"}`} onClick={modalIsFullscreen ? null : () => setModalIsFullscreen(true)}>
                        {modalBody}
                    </div>
                    {modalIsFullscreen ? <div className={styles.modalBackdrop} onClick={hideModal}></div> : null}
                </div>
            );
        }
    }
    return null;
}

export default Modal;