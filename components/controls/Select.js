import React, { useState, useEffect, useContext } from 'react';

import { GlobalContext } from '../../pages/_app';

import { packageOptions } from '../../utils';

const Select = (props) => {
    const { id, field, label, value, initialValue, options, foptions, filtersArray = [], Vstyle, hero, isRequired, tiny, children, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);
    const optionsArray = foptions ? foptions : packageOptions(options);
    const [expanded, setExpanded] = useState(false);
    const [displayOptions, setDisplayOptions] = useState(optionsArray);

    const { dispatch } = useContext(GlobalContext);

    if (debug) console.log(field, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        console.log("sending this to VForm:", input)
        if (updateForm) updateForm({ [field]: input }, recordId);
        setControlValue(input);
    }

    useEffect(() => { //on each change of parent value
        if (foptions) {
            setDisplayOptions(foptions);
        }

    }, [foptions])

    const handleChildren = () => {
        return React.Children.map(children, child => {
            if (debug) console.log(field, child);
            if (!child.props.options) return console.log("no options provided for", child.props.field);
            if (!child.props.filterKey) {
                console.log(`${child.props.field} has no filterKey specified`);
                return null;
            }
            //
            const filterObj = {
                filterBy: child.props.filterKey,
                filterFor: controlValue
            }
            const childFiltersArray = [...filtersArray, filterObj];
            // 
            const formattedChildOptions = packageOptions(child.props.options);
            const childOptions = formattedChildOptions.filter(option => {
                let result = true;
                childFiltersArray.forEach(filter => {
                    if (option[filter.filterBy]) {
                        if (option[filter.filterBy] != filter.filterFor) result = false;
                    }
                })
                return result;
            })

            return React.cloneElement(child, { value: child.props.value, foptions: childOptions, filtersArray: childFiltersArray, updateForm: updateForm, readonly: readonly }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    const findMatchingOption = () => {
        if(debug) console.log(field, "searching for", controlValue, "among options:", {optionsArray})
        const match =  optionsArray.find(option => {
            return option.id === controlValue;
        })
        if(debug) console.log(field, "found this match:", {match}, "among", optionsArray, "for", controlValue);
        if (match) return match;
        // return { id: "", name: "" };
        return {id:"", name:""};
    }
    const displaySelectValue = findMatchingOption().name;

    const filterSelectOptions = (searchStr) => {
        setExpanded(true);
        const searchResults = optionsArray.filter(option => {
            return option.name.toLowerCase().indexOf(searchStr.toLowerCase()) != -1 ? { option } : null;
        });
        setDisplayOptions(searchResults);
    }
    
    const validateSelectInput = (input) => {
        const exactMatch = optionsArray.find(option => {
            return option.name.toLowerCase() === input.toLowerCase();
        })
        if (exactMatch) {
            return exactMatch;
        }

        // if no exact match, find nearest match
        const nearestMatch = optionsArray.reduce((result, option, i) => {
            if (!option.name.toLowerCase().includes(input)) return result;

            const nextIndex = { index: i, position: option.name.toLowerCase().indexOf(input) }
            return nextIndex.position <= result.position ? nextIndex : result;
        }, { index: null, position: Number.POSITIVE_INFINITY });
        
        return nearestMatch.index ? optionsArray[nearestMatch.index] : controlValue;
    }

    const handleSelectChange = (input) => {
        filterSelectOptions(input);
    }
    
    const handleSelectKeyDown = (e) => {
        switch (e.key) {
            case "Enter":
            case "Tab":
                setDisplayOptions(optionsArray);
                const newOption = validateSelectInput(e.target.value);
                selectOption(newOption);
            default:
                break;
        }
    }

    const selectOption = (option) => {
        if (option != "") {
            setExpanded(false);
            handleControlValueChange(option.id);
        } else {
            setExpanded(true);
        }
    }

    useEffect(() => {
        if (expanded && !readonly) {
            const parentControl = document.getElementById(`select-${id}`)
            dispatch({
                type: "dropdown",
                payload: {
                    dim: { x: parentControl.offsetLeft, y: parentControl.offsetTop, h: parentControl.offsetHeight, w: parentControl.offsetWidth },
                    options: displayOptions,
                    action: selectOption
                }
            })
        } else {
            dispatch({
                type: "dropdown",
                payload: null
            })
        }

    }, [expanded])

    return (
        <>
            <div id={`select-${id}`} className={`input-control-base select-box${tiny ? " tiny" : ""}${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyle}>
                <label htmlFor={id} className="label" style={{ top: "3px", left: "3px" }}>{label}</label>
                <div className={`select-container${expanded ? " expanded" : ""}`} onClick={() => setExpanded(!expanded)}>
                    { !readonly && <i className="btn drop-down-arrow">expand_more</i> }
                    <input
                        id={id}
                        field={field}
                        value={displaySelectValue}
                        className="select-input"
                        type="text"
                        onKeyDown={(e) => handleSelectKeyDown(e)}
                        onChange={(e) => handleSelectChange(e.target.value)}
                        autoComplete="do-not-autofill"
                        required={isRequired}
                        readOnly={readonly}
                    />
                </div>
            </div>
            {
                clonedChildren
            }
        </>
    );

}

export default Select;