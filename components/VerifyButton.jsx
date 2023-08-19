'use client'

import React, { useState, useRef } from 'react';

const Verify = ({ mode, children }) => {
    const [verify, setVerify] = useState(false);
    const buttonRef = useRef();

    return (
        <div ref={buttonRef} className={`verify-base ${mode}${verify ? " reveal" : ""}`} onClick={() => setVerify(!verify)} onMouseLeave={() => setVerify(false)}>
            <div className={`top-button`}>
                {children[0]}
            </div>
            <div className={`bottom-button`}>
                {
                    React.cloneElement(
                        children[1],
                        {
                            ...children[1].props,
                            style: { ...children[1].props.style }
                        },
                        children[1].props.children
                    )
                }
            </div>
        </div>
    )
}

export default Verify;