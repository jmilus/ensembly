'use client'

import { useRef, useState, useEffect } from 'react';
import { createPortal } from "react-dom";

const PopupMenu = ({ parentRef, hideMe, position, children }) => {
    const menuRef = useRef();
    const [edgePos, setEdgePos] = useState({x: 0, y: 0})

    const parentPos = parentRef.current.getBoundingClientRect();
    const anchorNode = document.getElementById('app-body');

    console.log({ edgePos }, {parentPos})

    
    useEffect(() => {
        anchorNode.addEventListener('mouseup', clickHandler)
        const rightCutOff = menuRef.current.offsetWidth + menuRef.current.getBoundingClientRect().x > window.innerWidth;
        const bottomCutOff = menuRef.current.offsetHeight + menuRef.current.getBoundingClientRect().y > window.innerHeight;

        const newEdgePos = {
            x: rightCutOff ? parentRef.current.offsetWidth - menuRef.current.offsetWidth : 0,
            y: bottomCutOff ? parentRef.current.offsetHeight - menuRef.current.offsetHeight : 0,
        }
        setEdgePos(newEdgePos);

        return () => {
            anchorNode.removeEventListener('mouseup', clickHandler)
        }

    }, [])
    
    let popupPosition = {};
    if (parentRef.current) {
        
        popupPosition = {
            left: position?.x || parentPos.x + edgePos.x,
            top: position?.y || parentRef.current.offsetHeight + parentPos.y + edgePos.y,
            // minWidth: parentRef.current.offsetWidth
        }
        
    }

    function clickHandler(e) {
        if (parentRef.current.contains(e.target)) return
        const popups = document.getElementsByClassName("popup-children")
        console.log({popups})
        const clickedPopup = Object.values(popups).some(popup => popup.contains(e.target))
        if (clickedPopup) return
        console.log("click handler!", e.target);
        hideMe();
    }

    return createPortal(
        <>
            <div ref={menuRef} className="popup-children" style={popupPosition}>
                {children}
            </div>
            {/* {hideMe && 
                <div id="popup-backing" onClick={hideMe}></div>
            } */}
        </>,
        anchorNode
    )
}

export default PopupMenu;