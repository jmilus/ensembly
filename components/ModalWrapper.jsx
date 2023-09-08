'use client';

import React from 'react';
import { createPortal } from 'react-dom';

const ModalWrapper = ({ title, children, closeModal, dismiss="Cancel" }) => {

    let modalBody = [];
    let modalButtons = dismiss != null ? [<button key="dismissbutton0" className="dismiss" onClick={closeModal}>{dismiss}</button>] : [];
    React.Children.forEach(children, child => {
        console.log("filtering through modal children:", child)
        if (child.props.className === "modal-buttons") {
            React.Children.forEach(child.props.children, button => {
                modalButtons.push(button);
            })
        } else {
            modalBody.push(child);
        }
    })

    

    return (
        <div className="modal-base">
            <div className={`modal-wrapper`} >
                <div className="modal-border">
                    <div className="modal-container">
                        <div className="modal-header">{title}</div>
                        <div className="modal-body">
                            {modalBody}
                        </div>
                        <div className="modal-footer modal-buttons">
                            {modalButtons}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
    )
}

export default ModalWrapper;