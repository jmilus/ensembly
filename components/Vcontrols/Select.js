import React, { useState, useEffect, useContext } from 'react';

import { GlobalContext } from '../../pages/_app';

import { packageOptions } from '../../utils';

const Select = (props) => {
    const { id, name, label, value, options, filtersArray = [], extraAction, Vstyle, hero, isRequired, tiny, multiselect, children, readonly, debug } = props;
    const [controlOptions, setControlOptions] = useState(packageOptions(options, value))
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        const selectValue = Object.values(controlOptions).filter(option => {
            return option.selected;
        })
        if (extraAction) extraAction(selectValue);
    }, [controlOptions])
    
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

    const handleDropDownSelection = (input) => {
        Object.values(controlOptions).forEach(option => option.selected = false);
        
        if (!multiselect) {
            dispatch({ route: "dropdown", payload: null })

            const selectControl = document.getElementById(id)
            const inputEvent = new Event('change', { bubbles: true });
            selectControl.dispatchEvent(inputEvent);
        }

        setControlOptions({ ...controlOptions, [input.value]: input });
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
            let filterForArr = [];
            Object.values(controlOptions).map(option => option.selected && filterForArr.push(option.value))
            const filterObj = {
                filterBy: child.props.filterKey,
                filterFor: filterForArr
            }
            const childFiltersArray = [...filtersArray, filterObj];
            //
            

            return React.cloneElement(child, { filtersArray: childFiltersArray }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    const handleMultiSelection = (input) => {
        console.log("change handler", input)
        setControlOptions({ ...controlOptions, [input]: { ...controlOptions[input], selected: !controlOptions[input].selected } });
    }
    
    const handleBlur = (e) => {
        if (!touched) setTouched(true);
        // console.log(e.relatedTarget);
        if(e.relatedTarget) dispatch({route: "dropdown", payload: null})
    }

    const filterOptions = () => {
        if (!filtersArray.length) return controlOptions;
        const filteredOptions = Object.values(controlOptions).filter(option => {
            const excludeOption = filtersArray.every(filter => {
                return !filter.filterFor.includes(option[filter.filterBy]);
            })
            if (excludeOption) return false;
            return true
        })
        const filteredOptionsObject = Object.fromEntries(filteredOptions.entries());
        return filteredOptionsObject;
    }

    const showDropDown = () => {
        if (readonly || multiselect) return null;
        const parentControl = document.getElementById(`select-${id}`)
        dispatch({
            route: "dropdown",
            payload: {
                dim: { x: parentControl.offsetLeft, y: parentControl.offsetTop, h: parentControl.offsetHeight, w: parentControl.offsetWidth },
                options: filterOptions(),
                value: value,
                setSelectControlValue: handleDropDownSelection,
                multiselect
            }
        })
    }

    const hideOption = (option) => {
        if (!multiselect) return true;
        const filteredOptions = filterOptions();
        const result = Object.values(filteredOptions).find(fo =>  fo.id === option.id);

        return result ? false : true;
    }

    return (
        <>
            <div id={`select-${id}`} className={`input-control-base select-box${tiny ? " tiny" : ""}${label ? "" : " unlabeled"}${touched ? " touched" : ""}${multiselect ? " multi" : ""}`} style={Vstyle}>
                <label htmlFor={id} className="label" style={{ top: "3px", left: "3px" }}>{label}</label>
                <select
                    id={id}
                    name={name}
                    value={displayValue}
                    onChange={(e) => handleMultiSelection(e.target.value)}
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