'use client';

import React, { useContext } from 'react';
import { GlobalContext } from './ContextFrame';

const ModalButton = ({ modalButton, title, children, buttonStyle, modalStyle }) => {
    const { dispatch } = useContext(GlobalContext);

    // console.log("Modal:", { children })

    let modalBody = [];
    let modalButtons = [];
    React.Children.forEach(children, child => {
        if (child.props.className === "modal-buttons") {
            modalButtons.push(child);
        } else {
            modalBody.push(child);
        }
    })

    const modalContent =
        <>
            <div className="modal-header">{title}</div>
            <div className="modal-body" style={modalStyle}>{modalBody}</div>
            <div className="modal-footer">{modalButtons}</div>
        </>


    const showModal = () => {
        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    body: modalContent
                }
            }
        })
    }

    return (
        <button onClick={showModal} style={buttonStyle}>
            {modalButton}
        </button>
    )
}

export default ModalButton;