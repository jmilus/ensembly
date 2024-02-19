'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import ModalWrapper from '../components/ModalWrapper';

const ModalButton = ({ renderButton, title, children, buttonClass, modalClasses, buttonStyle, dismiss }) => {
    const [show, setShow] = useState(false);

    // console.log({ children })

    return (
        <>
            <button onClick={() => setShow(true)} className={buttonClass} style={buttonStyle}>
                {renderButton}
            </button>
            {show && 
                createPortal(
                    <ModalWrapper title={title} classes={modalClasses} closeModal={() => setShow(false)} dismiss={dismiss}>
                        {children}
                    </ModalWrapper>
                    , document.getElementById("app-body")
                )
            }
        </>
    )
}

export default ModalButton;