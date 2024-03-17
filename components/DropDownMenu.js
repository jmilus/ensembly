'use client'

import { useState, useContext } from 'react';

import { GlobalContext } from './ContextFrame';

const DropDownMenu = () => {
    const { dispatch, parameters: { dropdown } } = useContext(GlobalContext);
    if (!dropdown) return null
    const { dim, options = {}, value = [], setSelectControlValue } = dropdown;

    // console.log({ dropdown }, { dim }, { value })

    const hideDropDown = () => {
        dispatch({ route: "dropdown", payload: null })
    }
    
    const selectOption = (option, e) => {
        e.preventDefault()
        setSelectControlValue(option);
        hideDropDown();
    }

    const optionCount = Object.keys(options).length

    const windowHeight = window.innerHeight
    const ddBottom = (dim.y + dim.h + (Math.min(optionCount, 5.5) * 36));
    const ddTop = windowHeight > ddBottom ?
        dim.y + dim.h :
        dim.y - (Math.min(optionCount - value.length, 5.5) * 36);
    
    const ddPlacement = windowHeight > ddBottom ?
        { top: dim.y + dim.h } :
        { bottom: dim.y}

    if (optionCount > 0) {
        return (
            <div id="dropdown-area" onKeyDown={(e) => console.log(e.target.value)}>
                <div className="option-set" style={{ ...ddPlacement, left: dim.x, minWidth: dim.w}}>
                    {
                        Object.keys(options).map(key => {
                            const option = options[key];
                            if (value.includes(option.value)) return null;

                            let myColor;
                            if (option.color) {
                                myColor = option.color
                            }
                            return (
                                <div key={key} className="select-option" onClick={(e) => selectOption(key, e)}>
                                    {myColor && <div className="color-dot" style={{ backgroundColor: myColor }}></div>}
                                    {option.caption}
                                </div>
                            )
                        })
                    }
                </div>
                <div id="dropdown-backing" onClick={hideDropDown}></div>
            </div>
        )
    }
    return null;
}

export default DropDownMenu;