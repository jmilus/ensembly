'use client';

import { useRef, useState } from 'react';
import PopupMenu from './PopupMenu';
import { createPortal } from 'react-dom';

const ConfirmButton = (props) => {
    const buttonRef = useRef()
    const [showConfirm, setShowConfirm] = useState(false);

    const { button, style, popupStyle, children } = props;

    return (
        <>
            <button ref={buttonRef} style={style} onClick={() => setShowConfirm(!showConfirm)}>{button}</button>
            {showConfirm &&
                createPortal(
                    <PopupMenu
                        parentRef={buttonRef}
                        hideMe={() => setShowConfirm(!showConfirm)}
                        direction="right"
                        style={{...popupStyle}}
                    >
                        {children}
                    </PopupMenu>
                    ,
                    buttonRef.current
                )
            }
        </>
    )
}

export default ConfirmButton;