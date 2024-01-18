'use client'

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useEvent } from 'hooks/useEvent';

import { packageOptions } from '../../utils';

import PopupMenu from '../PopupMenu';


const EditSelect = (props) => {
    const { id, name, label, value, options, filtersArray = [], promptText, extraAction, style, innerStyle, hero, isRequired, specialSize="", children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || "");
    const [showPopup, setShowPopup] = useState(false);
    const [searchString, setSearchString] = useState("")
    const controlRef = useRef();
    const [inputRef, emitEvent] = useEvent('change', (e) =>
        console.log('Event fired', e, e.target)
    );

    let controlOptions = packageOptions(options, value)

    useEffect(() => {
        setControlValue(value)
    }, [value])

    if (Object.keys(controlOptions).length === 1 && !Object.keys(controlOptions).includes(controlValue)) {
        console.log(name, "has only one option:", controlOptions)
        setControlValue(Object.keys(controlOptions)[0])
    }

    if (debug) console.log(name, "select control state", { props }, { controlValue }, { controlOptions }, {filtersArray});

    const handleDropDownSelection = (input) => {
        console.log("selected:", input)
        emitEvent()
        
        if (extraAction) extraAction(input);
        setShowPopup(false);
        setControlValue(input)
    }

    const handleSearch = (e) => {
        e.stopPropagation();
        setSearchString(e.target.value)
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
            const childOptions = packageOptions(child.props.options)
            // console.log("packaged:", {childOptions})
            Object.keys(childOptions).forEach(key => {
                const option = childOptions[key]
                const exclude = childFiltersArray.every(filter => {
                    if(Array.isArray(option[filter.filterBy])) return !option[filter.filterBy].some(x => x == filter.filterFor)
                    return filter.filterFor != option[filter.filterBy];
                })
                if (!exclude) newChildOptions[key] = option;
            })

            return React.cloneElement(child, { options: newChildOptions, filtersArray: childFiltersArray }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    const displayValue = controlOptions[controlValue]?.caption ? controlOptions[controlValue]?.caption : promptText;

    return (
        <>
            <div ref={controlRef}  id={`select-${id}`} className={`verdant-control select-box ${specialSize}${hero ? " hero" : ""}${controlValue ? "" : " empty"}`} style={style}>
                {label != undefined &&
                    <label htmlFor={id} >{label}</label>
                }
                <div className="hover-effect">
                    {showPopup
                        ?
                        <input
                            id={`${id}-search`}
                            className="control-surface"
                            type="text"
                            value={searchString}
                            onChange={handleSearch}
                            // onFocus={() => setShowPopup(true)}
                            autoComplete="do-not-autofill"
                            placeholder={label}
                            autoFocus
                        />
                        :
                        <div className="control-surface" style={innerStyle} onClick={() => setShowPopup(true)}>{displayValue}</div>
                    }
                    
                    <select
                        ref={inputRef}
                        id={id}
                        name={name}
                        value={controlOptions[controlValue]?.value || ""}
                        onChange={() => null}
                        autoComplete="do-not-autofill"
                        style={{display: "none", height: "0px", overflow: "hidden"}}
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
            </div>
            {showPopup && 
                <PopupMenu
                    id={`${id}-popup`}
                    parentRef={controlRef}
                    hideMe={() => setShowPopup(false)}
                    matchParentWidth={true}
                >
                    {
                        Object.keys(controlOptions).map((key, o) => {
                            const option = controlOptions[key];
                            if (!option.caption.toLowerCase().includes(searchString.toLowerCase())) return;
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

const Select = (props) => {
    const { id, label, value = "", style, hero, specialSize="", children, readonly } = props;

    if (!readonly) return <EditSelect {...props} />

    return (
        <>
            <div id={`select-${id}`} className={`verdant-control select-box ${specialSize}${hero ? " hero" : ""}`} style={style}>
                {label && <label htmlFor={id} >{label}</label>}
                <div className="select-input" style={{height: "3em", fontFamily: "arial", padding: "10px 15px", borderBottom: "1px solid var(--gray3)"}}>{value}</div>
            </div>
            {children}
        </>
    )
}

export default Select;