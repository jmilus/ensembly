'use client'

import React, { useState, useEffect, useContext } from 'react';

import { GlobalContext } from '../ContextFrame';

import { packageOptions } from '../../utils';

import './Vstyling.css';

const Select = (props) => {
    const { id, name, label, value, options, filtersArray = [], extraAction, Vstyle, hero, isRequired, tiny, multiselect, children, readonly, debug } = props;
    // const [controlOptions, setControlOptions] = useState(packageOptions(options, value))
    const [controlValue, setControlValue] = useState(multiselect ? value : [value]);
    const [touched, setTouched] = useState(false);

    let controlOptions = packageOptions(options, value)
    
    const generateDisplayValue = () => {
        const selectedValues = []
        Object.values(controlOptions).forEach(option => {
            if (option.selected) selectedValues.push(option.value);
        })
        if (multiselect) {
            return selectedValues;
        } else {
            return selectedValues.join();
        }
    }

    let displayValue = generateDisplayValue();

    if (debug) console.log(name, "select control state", { props }, { displayValue }, { controlOptions }, {filtersArray});


    const { dispatch } = useContext(GlobalContext);

    const changeValues = (newValues) => {
        if (extraAction) extraAction(multiselect ? selectValue : selectValue[0]);

        setControlValue(newValues)
    }

    const handleDropDownSelection = (input) => {
        console.log(input);
        Object.values(controlOptions).forEach(option => option.selected = false);

        controlOptions = { ...controlOptions, [input.value]: input }
        
        // dispatch({ route: "dropdown", payload: null })

        const selectControl = document.getElementById(id)
        const inputEvent = new Event('change', { bubbles: true });
        selectControl.dispatchEvent(inputEvent);

        changeValues([input.value]);
    }

    const handleMultiSelection = (input) => {
        // console.log("change handler", input)
        changeValues({ ...controlOptions, [input]: { ...controlOptions[input], selected: !controlOptions[input].selected } });
    }

    // const filterOptions = (ops) => {
    //     if (!filtersArray.length) return Object.values(ops);
    //     const filteredOptions = Object.values(ops).filter(option => {
    //         const excludeOption = filtersArray.every(filter => {
    //             return !filter.filterFor.includes(option[filter.filterBy]);
    //         })
    //         if (excludeOption) return false;
    //         return true
    //     })
    //     return filteredOptions;
    // }

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
                filterFor: multiselect ? controlValue : controlValue[0]
            }
            
            const childFiltersArray = [...filtersArray, filterObj];
            //
            const newChildOptions = Object.values(child.props.options).filter(option => {
                const exclude = childFiltersArray.every(filter => {
                    return !filter.filterFor.includes(option[filter.filterBy]);
                })
                if (exclude) return false;
                return true;
            })

            console.log({newChildOptions})

            return React.cloneElement(child, { options: newChildOptions, filtersArray: childFiltersArray }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();
    
    const handleBlur = (e) => {
        if (!touched) setTouched(true);
        // console.log(e.relatedTarget);
        if(e.relatedTarget) dispatch({route: "dropdown", payload: null})
    }

    const showDropDown = () => {
        if (readonly || multiselect) return null;
        const parentControl = document.getElementById(`select-${id}`)
        dispatch({
            route: "dropdown",
            payload: {
                dim: { x: parentControl.offsetLeft, y: parentControl.offsetTop, h: parentControl.offsetHeight, w: parentControl.offsetWidth },
                options: Object.values(controlOptions),
                value: controlValue,
                setSelectControlValue: handleDropDownSelection,
                multiselect
            }
        })
    }

    const hideOption = (option) => {
        if (!multiselect) return true;
        const result = controlOptions.find(fo => fo.id === option.id);

        return result ? false : true;
    }

    return (
        <>
            <div id={`select-${id}`} className={`input-control-base select-box${tiny ? " tiny" : ""}${label ? "" : " unlabeled"}${touched ? " touched" : ""}${multiselect ? " multi" : ""}`} style={Vstyle}>
                <label htmlFor={id} className="label" style={{ top: "3px", left: "3px" }}>{label}</label>
                <select
                    id={id}
                    name={name}
                    value={multiselect ? controlValue : controlValue[0]}
                    onChange={multiselect ? (e) => handleMultiSelection(e.target.value) : () => null}
                    onFocus={showDropDown}
                    onBlur={handleBlur}
                    autoComplete="do-not-autofill"
                    multiple={multiselect}
                    required={isRequired}
                    readOnly={readonly}
                >
                    {!value && <option key="xx" value="" hidden></option>}
                    {
                        Object.values(controlOptions).map((option, o) => {
                            const hideMe = hideOption(option);
                            return <option key={o} id={option.id} value={option.value} hidden={hideMe} >{option.name}</option>
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