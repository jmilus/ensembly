'use client'

import { useState, useContext } from 'react';

import { GlobalContext } from './ContextFrame';

const DropDownMenu = () => {
    const { dispatch, parameters: { dropdown } } = useContext(GlobalContext);
    if (!dropdown) return null
    const { dim, options = [], value = "", setSelectControlValue } = dropdown;

    // console.log({ dropdown })

    const hideDropDown = () => {
        dispatch({ route: "dropdown", payload: null })
    }
    
    const selectOption = (option) => {
        setSelectControlValue(option);
        hideDropDown();
    }

    if (options.length > 0) {
        return (
            <div id="dropdown-area" onKeyDown={(e) => console.log(e.target.value)}>
                <div className="option-set" style={{left: dim.x, top: dim.y + dim.h, minWidth: dim.w}}>
                    {
                        options.map((option, o) => {
                            if (value.includes(option.value)) return null;

                            let optionColor, myColor;
                            if (option.color) {
                                optionColor = JSON.parse(option.color);
                                myColor = `${optionColor.type}(${optionColor.values[0]},${optionColor.values[1]}%, ${optionColor.values[2]}%)`;
                            }
                            return (
                                <div key={o} className="select-option" onClick={() => selectOption(option)}>
                                    {myColor && <div className="color-dot" style={{ backgroundColor: myColor }}></div>}
                                    {option.name}
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