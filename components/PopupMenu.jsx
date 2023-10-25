'use client'

import { useRef, useState, useEffect } from 'react';
import { createPortal } from "react-dom";

const PopupMenu = ({ id, parentRef, hideMe, position, children }) => {
    const menuRef = useRef();
    const [cutoffs, setCutoffs] = useState({})

    const parentPos = parentRef.current.getBoundingClientRect();
    const menuPos = menuRef.current ? menuRef.current.getBoundingClientRect() : {x: 0, y: 0, width: 0, height: 0};
    const anchorNode = document.getElementById('app-body');

    console.log({ id }, { cutoffs }, {parentPos}, menuPos)
    
    useEffect(() => {
        document.addEventListener('click', clickHandler)
        const menuPos = menuRef.current.getBoundingClientRect()
        setCutoffs({
            right: menuPos.width + menuPos.x > window.innerWidth,
            bottom: menuPos.height + menuPos.y > window.innerHeight
        });

        return () => {
            document.removeEventListener('click', clickHandler)
        }

    }, [])
    
    console.log(menuPos.height + menuPos.y > window.innerHeight, cutoffs.bottom)

    let popupPosition = {};

    if (position && menuPos) {
        popupPosition = {
            left: cutoffs.right ? window.innerWidth - menuPos.width : position.x,
            top: cutoffs.bottom ? window.innerHeight - menuPos.height : position.y
        }

    } else if (parentRef.current && menuPos) {
        popupPosition = {
            left: cutoffs.right ? parentPos.x - menuPos.width : parentPos.x,
            top: cutoffs.bottom ? parentPos.y - menuPos.height : parentPos.y + parentPos.height
        }
    }

    function clickHandler(e) {
        if (parentRef.current.contains(e.target)) {
            // console.log(id, "clicked in parent")
            return
        }
        if (menuRef.current.contains(e.target)) {
            // console.log(id, "clicked in self")
            return
        }
        
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