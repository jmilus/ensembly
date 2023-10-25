'use client'

import React, { useState, useEffect, useContext, useRef } from 'react';

import { GlobalContext } from '../ContextFrame';

import { packageOptions } from '../../utils';

import PopupMenu from '../PopupMenu';


const Select = (props) => {
    const { id, name, label, value, options, filtersArray = [], extraAction, style, hero, isRequired, specialSize="", children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || "");
    const [showPopup, setShowPopup] = useState(false);
    const selectRef = useRef();

    let controlOptions = packageOptions(options, value)

    useEffect(() => {
        setControlValue(value)
    }, [value])

    if (Object.keys(controlOptions).length === 1 && !Object.keys(controlOptions).includes(controlValue)) {
        console.log(name, "has only one option:", controlOptions)
        setControlValue(Object.keys(controlOptions)[0])
    }

    if (debug) console.log(name, "select control state", { props }, { controlValue }, { controlOptions }, {filtersArray});

    const { dispatch } = useContext(GlobalContext);

    const handleDropDownSelection = (input) => {
        console.log("selected:", input)
        const selectControl = document.getElementById(id)
        const inputEvent = new Event('change', { bubbles: true });
        selectControl.dispatchEvent(inputEvent);

        if (extraAction) extraAction(input);
        setShowPopup(false);
        setControlValue(input)
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            if (debug) console.log(name, "children:",  child);
            if (!child.props.options) return console.log("no options provided for", child.props.name);
            if (!child.props.filterKey) {
                console.log(`${child.props.name} has no filterKey specified`);
                return null;
            }
            //
            const filterObj = {
                filterBy: child.props.filterKey,
                filterFor: controlValue
            }
            
            const childFiltersArray = [...filtersArray, filterObj];
            //
            const newChildOptions = {}
            Object.keys(child.props.options).forEach(key => {
                const option = child.props.options[key]
                const exclude = childFiltersArray.every(filter => {
                    return filter.filterFor != option[filter.filterBy];
                })
                if (!exclude) newChildOptions[key] = option;
            })

            return React.cloneElement(child, { options: newChildOptions, filtersArray: childFiltersArray }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    const showDropDown = (e) => {
        // e.preventDefault();
        if (readonly) return null;
        
        setShowPopup(true)
    }

    return (
        <>
            <div ref={selectRef}  id={`select-${id}`} className={`input-control-base select-box ${specialSize}${hero ? " hero" : ""}${controlValue ? "" : " empty"}`} style={style}>
                {label != undefined &&
                    <label htmlFor={id} className="label">{label}</label>
                }
                <select
                    id={id}
                    name={name}
                    value={controlOptions[controlValue]?.value || ""}
                    onChange={() => null}
                    onFocus={showDropDown}
                    autoComplete="do-not-autofill"
                    required={isRequired}
                    readOnly={readonly}
                    style={controlOptions[controlValue]?.color ? { color: `hsl(${controlOptions[controlValue].color})` } : {}}
                >
                    {!value && <option key="xx" value="" hidden>{label}</option>}
                    {
                        Object.values(controlOptions).map((option, o) => {
                            // const hideMe = hideOption(option);
                            return <option key={o} id={option.id} value={option.value} hidden={true} >{option.caption}</option>
                        })
                    }
                </select>
            </div>
            {showPopup && 
                <PopupMenu
                    id={`${id}-popup`}
                    parentRef={selectRef}
                    hideMe={() => setShowPopup(false)}
                >
                    {
                        Object.keys(controlOptions).map((key, o) => {
                            const option = controlOptions[key];
                            return (
                                <div key={o} id={option.id} className="select-option" style={{['--hover-color']: option.color ? `hsl(${option.color})` : 'var(--mint5)', padding: "10px 15px"}} onClick={(e) => handleDropDownSelection(key, e)}>
                                    {option.color && <div className="color-dot" style={{marginRight: "10px", backgroundColor: `hsl(${option.color})`}}></div>}
                                    <span style={{color: `hsl(${option.color})`}}>{option.caption && option.caption}</span>
                                </div>
                            )
                        })
                    }
                </PopupMenu>
            }
            {
                clonedChildren
            }
        </>
    );

}

export default Select;