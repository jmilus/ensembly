'use client';

import React, {useContext} from 'react';
import { GlobalContext } from './ContextFrame';

const Modal2 = ({ modalButton, title, children }) => {
    const { dispatch } = useContext(GlobalContext);

    const hideModal = () => {
        dispatch({
            route: "modal",
            payload: null
        })
    }

    const modalBody =
        <div id="modal" className="modal-base">
            <div className={`modal-wrapper`} >
                <div className="modal-border">
                    <div className="modal-container">
                        <div className="modal-header">{title}</div>
                        {
                            React.cloneElement(children, {onSubmit: () => console.log("******it works!******")}, children.props.children)
                        }
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={hideModal}></div>
        </div>

    const showModal = () => {
        dispatch({
            route: "modal",
            payload: {
                type: "form",
                content: {
                    title: title,
                    body: modalBody
                }
            }
        })
    }

    return (
        <div className="modal-activation" onClick={() => showModal()}>
            {modalButton}
        </div>
    )
}

export default Modal2;