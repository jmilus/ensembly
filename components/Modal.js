'use client'

import React, { Children, useContext, useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/';

import { GlobalContext } from './ContextFrame';

import './modal.css';

const Modal = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { modal } = parameters;
    const [modalIsFullscreen, setModalIsFullscreen] = useState(true)
    // console.log("rendering modal with:", modal, modalIsFullscreen);

    // useEffect(() => {
    //     setModalIsFullscreen(true)
    // }, [modal])

    const hideModal = () => {
        if (modal.type === "load") {
            console.log("setting fullscreen to false")
            setModalIsFullscreen(false)
        } else {
            dispatch({ route: "modal", payload: null })
        }
    }

    const ModalThing = ({type, children}) => {
        return (
            <div className="modal-base">
                <div className={`modal-wrapper ${type}${modalIsFullscreen ? "" : " min"}`} onClick={modalIsFullscreen ? null : () => setModalIsFullscreen(true)}>
                    <div className="modal-border">
                        <div className="modal-container">
                            {children}
                        </div>
                    </div>
                </div>
                {modalIsFullscreen ? <div className="modal-backdrop" onClick={hideModal}></div> : null}
            </div>
        )
    }

    if (modal) {
        const { type, content } = modal;
        switch (type) {
            case "error":
                let { error } = content
                console.log("error thingy:", {error})
                return (
                    <ModalThing type="error">
                        <div className="modal-header">{content.title}</div>
                        <div className="modal-body">{content.error?.stack}</div>
                    </ModalThing>
                )
            case "hide":
                return null
            default:
                return (
                    <ModalThing>
                        {content.body}
                    </ModalThing>
                )
        }
    }
    return null;
}

export default Modal;