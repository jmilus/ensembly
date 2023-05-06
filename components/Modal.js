'use client'

import React, { Children, useContext, useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/';

import { GlobalContext } from './ContextFrame';

import '../styles/modal.css';

const Modal = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { modal } = parameters;
    const [modalIsFullscreen, setModalIsFullscreen] = useState(true)
    // console.log("rendering modal with:", modal, modalIsFullscreen);

    useEffect(() => {
        setModalIsFullscreen(true)
    }, [modal])

    const hideModal = () => {
        if (modal.type === "load") {
            console.log("setting fullscreen to false")
            setModalIsFullscreen(false)
        } else {
            dispatch({ route: "modal", payload: null })
        }
    }
    
    let modalBody = null;

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
                            <div className="error">
                                {errMessage}
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="panel" onClick={hideModal}>OK</button>
                            </div>
                        </>
                    break;
                case "form":
                    modalBody =
                        < >
                            <div className="modal-header">{content.title}</div>
                            {content.body}
                        </>
                    break;
                case "message":
                    modalBody =
                        <>
                            <div className="modal-header">{content.title}</div>
                            <div className="modal-alert-message">
                                <i>help</i>
                                <div className="modal-message">{content.body}</div>
                            </div>
                        </>
                    break;
                default:
                    console.log("no modal type specified");
                    break;
            }
            return (
                <div className="modal-base">
                    <div className={`modal-wrapper ${modalIsFullscreen ? "" : "min"}`} onClick={modalIsFullscreen ? null : () => setModalIsFullscreen(true)}>
                        <div className="modal-border">
                            <div className="modal-container">
                                {modalBody}
                            </div>
                        </div>
                    </div>
                    {modalIsFullscreen ? <div className="modal-backdrop" onClick={hideModal}></div> : null}
                </div>
            );
        }
    }
    return null;
}

export default Modal;