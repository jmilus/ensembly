'use client'

import { useRef, useState, useEffect } from 'react';
import { createPortal } from "react-dom";

const PopupMenu = ({ parentRef, hideMe, children }) => {
    const menuRef = useRef();
    const [edgePos, setEdgePos] = useState({x: 0, y: 0})

    const parentPos = parentRef.current.getBoundingClientRect();
    console.log({parentPos}, {edgePos})

    useEffect(() => {
        const rightCutOff = menuRef.current.offsetWidth + menuRef.current.getBoundingClientRect().x > window.innerWidth;
        const bottomCutOff = menuRef.current.offsetHeight + menuRef.current.getBoundingClientRect().y > window.innerHeight;
        console.log(parentRef.current.offsetWidth, menuRef.current.offsetWidth)

        const newEdgePos = {
            x: rightCutOff ? parentRef.current.offsetWidth - menuRef.current.offsetWidth : 0,
            y: bottomCutOff ? parentRef.current.offsetHeight - menuRef.current.offsetHeight : 0,
        }
        setEdgePos(newEdgePos);
    }, [])
    
    let popupPosition = {};
    if (parentRef.current) {
        console.log(parentRef)
        
        popupPosition = {
            left: parentPos.x + edgePos.x,
            top: parentRef.current.offsetHeight + parentPos.y + edgePos.y,
            minWidth: parentRef.current.offsetWidth
        }
        
    }

    return createPortal(
        <div id="popup-menu-wrapper">
            <div ref={menuRef} className="popup-children" style={popupPosition}>
                {children}
            </div>
            <div id="popup-backing" onClick={hideMe}></div>
        </div>,
        document.getElementById('app-body')
    )
}

export default PopupMenu;