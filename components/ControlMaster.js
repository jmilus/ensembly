import { floor } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';

import { packageOptions } from '../utils';

export const Control = (props) => {
    const { type, id, name, label, value="", options, foptions, format, maxValue, filtersArray=[], inheritedStyles, hero, isRequired, tiny, children, recordId, updateForm, debug } = props;
    const [controlValue, setControlValue] = useState(value);

    // useEffect(() => {
    //     if (!value?.isLoading) {
    //         setControlValue(value);
    //     } else {
    //         type = "isLoading"
    //     }
    // }, [value])

    if (debug) console.log(name, { props }, { controlValue });

    // if (value?.isLoading) {
    //     return (
    //         <object className={`input-control-base text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}`} style={inheritedStyles}>
    //             <div className="text-input">LOADING...</div>
    //             <label htmlFor={id} className="label" style={labelPosition[labelMode]}>{label}</label>
    //         </object>
    //     )
    // }

    const handleControlValueChange = (input) => {
        updateForm({ [name]: input }, recordId);
        setControlValue(input);
    }

    
    switch (type) {
        case "text":
            const labelPosition = {
                in: { top: "31px", left: "10px" },
                out:{ top:  "3px", left:  "3px" }
            }
            const labelMode = controlValue == "" ? "in" : "out";
            return (
                <object className={`input-control-base text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}`} style={inheritedStyles}>
                    <input
                        id={id}
                        name={name}
                        value={controlValue}
                        type="text"
                        className="text-input"
                        // onFocus={() => setLabelMode("out")}
                        // onBlur={() => setLabelMode(value == "" ? "in" : "out")}
                        onChange={(e) => handleControlValueChange(e.target.value)}
                        required={isRequired}
                        autoComplete="do-not-autofill"
                    />
                    <label htmlFor={id} className="label" style={labelPosition[labelMode]}>{label}</label>
                </object>
            );
        
        case "number":
            const handleNumberChange = (input) => {
                const rawNumber = input.replace(/[^0-9]*/gm, '');
        
                switch (format) {
                    case "weight":
                        handleControlValueChange(parseInt(rawNumber));
                        break;
                    case "height":
                        let inches = parseInt(rawNumber.slice(-2));
                        let feet = rawNumber.slice(0, -2);
                        if (inches > 11) {
                            feet = feet + rawNumber.slice(-2, -1);
                            inches = parseInt(rawNumber.slice(-1));
                        }
                        const heightInInches = (feet * 12) + inches;
                        handleControlValueChange(heightInInches);
                        break;
                    case "phone":
                        handleControlValueChange(rawNumber);
                        break;
                    default:
                }
            }
        
            let displayNumberValue = 0;
            switch (format) {
                case "weight":
                    displayNumberValue = `${controlValue || 0} lbs`;
                    break;
                case "height":
                    let feet = (floor(controlValue / 12)).toString();
                    let inches = (controlValue % 12).toString();
                    // inches = inches.length < 2 ? `0${inches}` : inches;
                    displayNumberValue = `${feet}' ${inches}"`;
                    break;
                case "phone":
                    displayNumberValue = controlValue;
                    if (controlValue?.length > 4) {
                        if (controlValue.length > 7) {
                            if (controlValue.length >= 10) {
                                if (controlValue.length > 10) {
                                    displayNumberValue = "+" + displayNumberValue.slice(0, -10) + " " + displayNumberValue.slice(-10);
                                }
                                displayNumberValue = displayNumberValue.slice(0, -10) + "(" + displayNumberValue.slice(-10);
                            }
                            displayNumberValue = displayNumberValue.slice(0, -7) + ") " + displayNumberValue.slice(-7);
                        }
                        displayNumberValue = displayNumberValue.slice(0, -4) + "-" + displayNumberValue.slice(-4);
                    }
                    break;
                default:
            }
            
            return (
                <object className={`input-control-base text-box${label ? "" : " unlabeled"}`} style={inheritedStyles}>
                    <input
                        id={id}
                        name={name}
                        value={displayNumberValue}
                        type="text"
                        className="text-input"
                        onChange={(e) => handleNumberChange(e.target.value)}
                        required={isRequired}
                        autoComplete="do-not-autofill"
                    />
                    <label htmlFor={id} className="label" style={{ top: "3px", left: "3px" }}>{label}</label>
                </object>
            );
        
        case "date":
            const defineLimit = (limit) => {
                switch (limit?.type) {
                    case "now":
                        return new Date().toISOString().slice(0, 10);
                    case "pad":
                        const d = new Date();
                        if (limit.year) d.setFullYear(d.getFullYear() - limit.year);
                        if (limit.month) d.setMonth(d.getMonth() - limit.month);
                        if (limit.day) d.setDate(d.getDate() - limit.day);
                        return d;
                    case "specific":
                        return limit.date;
                    default:
                        break;
                }
                return null;
            }
    
            const displayDate = controlValue ? controlValue.slice(0, 10) : "";
            const maxDate = defineLimit(maxValue); 
            
            return (
                <object id={`date-${id}`} className={`input-control-base date-box${label ? "" : " unlabeled"}`} style={inheritedStyles}>
                    <input
                        id={id}
                        name={name}
                        value={displayDate}
                        type="date"
                        className=""
                        onChange={(e) => handleControlValueChange(e.target.value)}
                        max={maxDate}
                        required={isRequired}
                        autoComplete="do-not-autofill"
                    />
                    <label htmlFor={name} className="label" style={{top: "3px", left: "3px"}}>{label}</label>
                </object>
            );
        
        case "select":
            const optionsArray = foptions ? foptions : packageOptions(options);
            const [expanded, setExpanded] = useState(false);
            const [displayOptions, setDisplayOptions] = useState(optionsArray);
            
            if (debug) console.log(name, { displayOptions });

    
            const findMatchingOption = () => {
                if(debug) console.log(name, "searching for", controlValue, "among options:", {optionsArray})
                const match =  optionsArray.find(option => {
                    return option.id === controlValue;
                })
                if(debug) console.log(name, "found this match:", {match}, "among", optionsArray, "for", controlValue);
                if (match) return match;
                // return { id: "", name: "" };
                return {id:"", name:""};
            }
            const displaySelectValue = findMatchingOption().name;
            
            useEffect(() => { //on each change of parent value
                if (foptions) {
                    setDisplayOptions(foptions);
                }

            }, [foptions])

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

                    const valueNotInOptions = childOptions.every(op => {
                        if(child.props.debug) console.log("checking for match in options for", child.props.name, op.id, child.props.value, op.id != child.props.value)
                        return op.id != child.props.value;
                    })
                    if(debug) console.log(child.props.name, {valueNotInOptions})
                    const childControlValue = valueNotInOptions ? "" : child.props.value; 

                    return React.cloneElement(child, { value: childControlValue, foptions: childOptions, filtersArray: childFiltersArray, updateForm: updateForm }, child.props.children)
                })
            }
            const clonedChildren = handleChildren()
    
            const filterOptions = (searchStr) => {
                setExpanded(true);
                const searchResults = optionsArray.filter(option => {
                    return option.name.toLowerCase().indexOf(searchStr.toLowerCase()) != -1 ? { option } : null;
                });
                setDisplayOptions(searchResults);
            }
            
            const validateInput = (input) => {
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
                filterOptions(input);
            }
            
            const handleKeyDown = (e) => {
                switch (e.key) {
                    case "Enter":
                    case "Tab":
                        setDisplayOptions(optionsArray);
                        const newOption = validateInput(e.target.value);
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
    
            const handleMouseOut = (event) => {
                const selectObject = document.getElementById(`select-${id}`);
                if (event.relatedTarget && event.relatedTarget.className) {
                    if (selectObject.compareDocumentPosition(event.relatedTarget) === 20) {
                        return null;
                    }
                }
                setExpanded(false);
            }

            return (
                <>
                    <object id={`select-${id}`} className={`input-control-base select-box${tiny ? " tiny" : ""}${label ? "" : " unlabeled"}`} style={inheritedStyles}>
                        <div className={`select-container${expanded ? " expanded" : ""}`} onClick={() => setExpanded(!expanded)}>
                            <i className="drop-down-arrow">expand_more</i>
                            <input
                                id={id}
                                name={name}
                                value={displaySelectValue}
                                className="select-input"
                                type="text"
                                onKeyDown={(e) => handleKeyDown(e)}
                                onChange={(e) => handleSelectChange(e.target.value)}
                                onMouseLeave={(e) => handleMouseOut(e)}
                                autoComplete="do-not-autofill"
                                required={isRequired}
                            />
                            <div className="option-set" onMouseLeave={(e) => handleMouseOut(e)}>
                                {
                                    displayOptions.map((option, i) => {
                                        return <div key={i} className="select-option" onClick={() => selectOption(option)} >{option.name}</div>
                                    })
                                }
                            </div>
                        </div>
                        <label htmlFor={id} className="label" style={{ top: "3px", left: "3px" }}>{label}</label>
                    </object>
                    {
                        clonedChildren
                    }
                </>
            );

        default:
            return null;
    }
}

const VControl = () => {
    return <></>
}

VControl.Text = (props) => <Control {...props} type="text" />;
VControl.Number = (props) => <Control {...props} type="number" />;
VControl.Date = (props) => <Control {...props} type="date" />;
VControl.Select = (props) => <Control {...props} type="select" />;

export default VControl;