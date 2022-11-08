import React, { Children, useContext, useState, useEffect } from 'react';
// import useModal from '../hooks/useModal';

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
            switch (modal.type) {
                case "load":
                    modalBody =
                        <div className="loading">
                            Loading...
                        </div>
                    break;
                case "error":
                    modalBody =
                        <>
                            <div className={styles.error}>
                                {modal.message}
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className="panel" onClick={hideModal}>OK</button>
                            </div>
                        </>
                    break;
                case "form":
                    console.log("modal is a form!");
                    const { title, body, URL, recordId, linkedId } = modal.content;
                    modalActions =
                        <section id="modal-actions" className="panel-buttons">
                            {
                                modal.buttons.map(button => {
                                    let action = button.name === "dismiss" ? hideModal : button.action;
                                    return <button name={button.name} className={button.style} onClick={action}>{button.caption}</button>
                                })
                            }
                            
                        </section>
                    modalBody =
                        <VForm id="modal-form" APIURL={URL} manual="true" followUp={modal.followUp} recordId={recordId} linkedId={linkedId} >
                            <div className={styles.modalHeader}>{title}</div>
                            {body}
                            {modalActions}
                        </VForm>
                    break;
                default:
                    console.log("no modal type specified");
                    break;
            }
            return (
                <div className="modal-base">
                    <div className={`modal-body ${modalIsFullscreen ? "" : "min"}`} onClick={modalIsFullscreen ? null : setIsFullscreen(true)}>
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