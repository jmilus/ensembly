import React, { Children, useContext, useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/';

import { GlobalContext } from "../pages/_app";

import VForm from '../components/VForm';

import styles from '../styles/Modal.module.css'

const Modal = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { modal } = parameters;
    const [modalIsFullscreen, setModalIsFullscreen] = useState(true)
    console.log("rendering modal with:", modal);

    const hideModal = () => {
        if (modal.type === "load") {
            setModalIsFullscreen(false)
        } else {
            dispatch({ type: "modal", payload: null })
        }
    }
    
    let modalBody, modalActions = null;

    if (modal) {
        if (modal.type != "hide") {
            const { content } = modal;
            switch (modal.type) {
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
                    modalActions =
                        <section id="modal-actions" className="panel-buttons">
                            {
                                modal.buttons.map((button, i) => {
                                    let action = button.name === "dismiss" ? hideModal : button.action;
                                    return <button key={i} name={button.name} className={button.class} onClick={action}>{button.caption}</button>
                                })
                            }
                        </section>
                    modalBody =
                        <VForm id="modal-form" APIURL={content.URL} manual="true" followUp={modal.followUp} recordId={content.recordId} additionalIds={content.additionalIds} fileUpload={content.file} context={content.context} >
                            <div className={styles.modalHeader}>{content.title}</div>
                            {content.body}
                            {modalActions}
                        </VForm>
                    break;
                case "message":
                    modalActions =
                        <section id="modal-actions" className="panel-buttons" onClick={hideModal}>
                            {
                                modal.buttons.map((button, i) => {
                                    let action = button.name === "dismiss" ? hideModal : button.action;
                                    return <button key={i} name={button.name} className={button.class} onClick={action}>{button.caption}</button>
                                })
                            }
                            
                        </section>
                    modalBody = 
                        <>
                            <div className={styles.modalHeader}>{content.title}</div>
                            <div className={styles.modalAlertMessage}>
                                <i>help</i>
                                <div className="modal-message">{content.body}</div>
                            </div>
                            {modalActions}
                        </>
                default:
                    console.log("no modal type specified");
                    break;
            }
            return (
                <div className="modal-base">
                    <div className={`modal-body ${modalIsFullscreen ? "" : "min"}`} onClick={modalIsFullscreen ? null : setModalIsFullscreen(true)}>
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