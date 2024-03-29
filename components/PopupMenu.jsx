'use client'

import { useRef, useState, useEffect } from 'react';
import { createPortal } from "react-dom";

const PopupMenu = ({ id, parentRef, hideMe, position, matchParentWidth=false, direction="down", style, children }) => {
    const menuRef = useRef();
    const [cutoffs, setCutoffs] = useState({})

    const parentPos = parentRef.current.getBoundingClientRect();
    const menuPos = menuRef.current ? menuRef.current.getBoundingClientRect() : {x: 0, y: 0, width: 0, height: 0};
    const anchorNode = document.getElementById('app-body');

    // console.log("popup:", children)
    
    useEffect(() => {
        document.addEventListener('click', clickHandler, true)
        const menuPos = menuRef.current.getBoundingClientRect()
        setCutoffs({
            right: menuPos.width + menuPos.x > window.innerWidth,
            left: menuPos.x < 0,
            bottom: menuPos.height + menuPos.y > window.innerHeight,
            top: menuPos.y < 0
        });

        return () => {
            document.removeEventListener('click', clickHandler, true)
        }

    }, [])

    let popupPosition = { width: matchParentWidth ? parentPos.width : "auto" };

    if (position && menuPos) {
        popupPosition.left = cutoffs.right ? window.innerWidth - menuPos.width : position.x,
        popupPosition.top = cutoffs.bottom ? window.innerHeight - menuPos.height : position.y

    } else if (parentRef.current && menuPos) {
        
        switch (direction) {
            case "down":
                popupPosition.left = cutoffs.right ? parentPos.x - (menuPos.width - parentPos.width) : parentPos.x
                if (cutoffs.bottom) {
                    popupPosition.bottom = window.innerHeight - parentPos.y
                } else {
                    popupPosition.top = parentPos.y + parentPos.height;
                }
                break;
            case "down left":
                popupPosition.left = cutoffs.left ? parentPos.x : parentPos.x - (menuPos.width - parentPos.width)
                if (cutoffs.bottom) {
                    popupPosition.bottom = window.innerHeight - parentPos.y
                } else {
                    popupPosition.top = parentPos.y + parentPos.height;
                }
                break;
            case "up":
                popupPosition.left = parentPos.x;
                popupPosition.top = cutoffs.top ? parentPos.y + parentPos.height : parentPos.y - menuPos.height;
                break;
            case "left":
                popupPosition.left = cutoffs.left ? parentPos.right : parentPos.x - menuPos.width;
                popupPosition.top = cutoffs.bottom ? parentPos.bottom - menuPos.height : parentPos.y;
                break;
            case "right":
                popupPosition.left = cutoffs.right ? parentPos.x - menuPos.width :parentPos.right;
                popupPosition.top = cutoffs.bottom ? parentPos.bottom - menuPos.height : parentPos.y;
                break;
            default:
                break;
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
        // console.log(id, "clicked outside")
        hideMe();
    }

    return createPortal(
        <>
            <div ref={menuRef} className="popup-children" style={{...style, ...popupPosition}}>
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