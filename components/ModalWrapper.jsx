'use client';

import React from 'react';

const ModalWrapper = ({ title, classes="", children, closeModal, dismiss="Cancel" }) => {

    let modalBody = [];
    let modalButtons = dismiss != null ? [<button key="dismissbutton0" className="dismiss" onClick={closeModal}>{dismiss}</button>] : [];
    React.Children.forEach(children, child => {
        // console.log("filtering through modal children:", child)
        if (child.props.className === "modal-buttons") {
            React.Children.forEach(child.props.children, button => {
                modalButtons.push(button);
            })
        } else {
            modalBody.push(child);
        }
    })

    const handleFormSubmit = (e) => {
        if (e.nativeEvent.submitter?.name === "submit") {
            closeModal();
        }
    }

    return (
        <div id="modal" className="modal-base">
            <div className={`modal-wrapper ${classes}`} >
                <div className="modal-container">
                    <div className="modal-header">{title}</div>
                    <div className="modal-body" onSubmit={handleFormSubmit}>
                        {modalBody}
                    </div>
                    <div className="modal-footer modal-buttons">
                        {modalButtons}
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
    )
}

export default ModalWrapper;