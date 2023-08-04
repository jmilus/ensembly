'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const ModalWrapper = ({ title, children }) => {
    const router = useRouter();
    
    const hideModal = () => {

        router.back()
    }

    let modalBody = [];
    let modalButtons = [];
    React.Children.forEach(children, child => {
        console.log("filtering through modal children:", child)
        if (child.props.className === "modal-buttons") {
            modalButtons.push(child);
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
                        <div className="modal-footer">
                            {modalButtons}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={hideModal}></div>
        </div>
    )
}

export default ModalWrapper;