'use client'

import React, { useState, useEffect, useContext } from 'react';

import { GlobalContext } from '../ContextFrame';

import { packageOptions } from '../../utils';

import './Vstyling.css';

const Select = (props) => {
    const { id, name, label, value, options, filtersArray = [], extraAction, style, hero, isRequired, specialSize="", children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || "");

    useEffect(() => {
        setControlValue(value)
    }, [value])

    let controlOptions = packageOptions(options, value)

    if (debug) console.log(name, "select control state", { props }, { controlValue }, { controlOptions }, {filtersArray});

    const { dispatch } = useContext(GlobalContext);

    const handleDropDownSelection = (input) => {
        console.log(name, "selected", input);

        const selectControl = document.getElementById(id)
        const inputEvent = new Event('change', { bubbles: true });
        selectControl.dispatchEvent(inputEvent);

        if (extraAction) extraAction(input);

        setControlValue(input)
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            if (debug) console.log(name, child);
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
    
    const handleBlur = (e) => {
        // console.log(e.relatedTarget);

        if(e.relatedTarget) dispatch({route: "dropdown", payload: null})
    }

    const showDropDown = (e) => {
        e.preventDefault();
        if (readonly) return null;
        const parentControl = document.getElementById(id)
        console.log({ parentControl })
        const { x, y } = parentControl.getBoundingClientRect()
        console.log(parentControl.getBoundingClientRect())
        dispatch({
            route: "dropdown",
            payload: {
                dim: { x: x, y: y, h: parentControl.offsetHeight, w: parentControl.offsetWidth },
                options: controlOptions,
                value: [controlValue],
                setSelectControlValue: handleDropDownSelection,
            }
        })
    }

    // const hideOption = (option) => {
    //     if (!multiselect) return true;
    //     const result = controlOptions.find(fo => fo.id === option.id);

    //     return result ? false : true;
    // }

    return (
        <>
            <div id={`select-${id}`} className={`input-control-base select-box ${specialSize}${label ? "" : " unlabeled"}`} style={style}>
                <label htmlFor={id} className={`label ${controlValue ? "" : "hide"}`}>{label}</label>
                <select
                    id={id}
                    name={name}
                    value={controlOptions[controlValue]?.value || ""}
                    onChange={() => null}
                    onFocus={showDropDown}
                    onBlur={handleBlur}
                    autoComplete="do-not-autofill"
                    required={isRequired}
                    readOnly={readonly}
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
            {
                clonedChildren
            }
        </>
    );

}

export default Select;