import React from 'react';
import { useState, useEffect } from 'react';
import { packageEnum } from '../utils';

const SelectControl = ({ id, name, label, initialValueId, inheritedStyles, tiny, options, binding, filterWith, children }) => {
    const [expanded, setExpanded] = useState(false);
    const [optionsList, setOptionsList] = useState([]);
    const standardDropDownStyle = { top: "100%", bottom: "unset" };
    const [dropDownStyle, setDropDownStyle] = useState(standardDropDownStyle);

    if (name === "role") {
        // console.log({ initialValueId }, { options })
    }
    console.log(name, { children });

    let defaultValue = {name:""}
    if (initialValueId && optionsList.length > 0) {
        defaultValue = optionsList.find(option => {
            return option.id === initialValueId
        });
    }

    const resetOptions = (initialOptions) => {
        const options = packageEnum(initialOptions);
        setOptionsList(options);
    }

    useEffect(() => {
        resetOptions(options)
    }, [options])

    useEffect(() => {
        const optionSet = document.querySelector(`#select-${id} .option-set`).getBoundingClientRect();

        if (expanded) {
            let dropDownOrientation;
            if (optionSet.bottom > window.innerHeight) {
                dropDownOrientation = { top: "unset", bottom: "100%" }
            } else {
                dropDownOrientation = standardDropDownStyle;
            }
            setDropDownStyle(dropDownOrientation);
            
        } else {
            setDropDownStyle(standardDropDownStyle);
        }
        
    }, [expanded])

    const handleClick = () => {
        resetOptions(options);
        setExpanded(true);
    }

    const handleKeyDown = (e) => {
        switch (e.key) {
            case "Enter":
                validateValue(e.target.value);
                break;
            case "Tab":
            default:
                break;
        }
    }

    const closeOptions = () => {
        setExpanded(false);
        //validateValue();
    }

    const optionSelected = (option) => {
        const validatedOption = validateValue(option);
        if (binding) binding(option);
        triggerChange(validatedOption);
    }

    const handleMouseOut = (event) => {
        const selectObject = document.getElementById(`select-${id}`);
        if (event.relatedTarget && event.relatedTarget.className) {
            if (selectObject.compareDocumentPosition(event.relatedTarget) === 20) {
                return null;
            }
        }
        closeOptions();
    }
    
    const triggerChange = (option) => {
        const selectInput = document.getElementById(id);
        selectInput.setAttribute('data-realvalue', option.id);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(selectInput, option.name);
        var ev2 = new Event('change', { bubbles: true });
        selectInput.addEventListener('change', () => {
            console.log("a change event happened!")
        })
        selectInput.dispatchEvent(ev2);
    }

    const filterOptions = (searchValue) => {
        const filteredOptions = optionsList.filter(option => {
            return option.name.indexOf(searchValue) != -1 ? { option } : null;
        })
        setOptionsList(filteredOptions)
    }

    const validateValue = (inputObject) => {
        const inputValue = inputObject.name;
        let selected = undefined;
        setExpanded(false);
        //let input = document.querySelector(`#select-${id} input.select-input`).value;
        const valid = optionsList.find(option => {
            return option.name === inputValue;
        });
        if (valid === undefined) {
            const nearMatch = optionsList.reduce((result, option, i) => {
                if (!option.name.includes(inputValue)) return result

                const nextDex = { index: i, position: option.name.indexOf(inputValue) }
                return nextDex.position <= result.position ? nextDex : result;
            }, { index: null, position: Number.POSITIVE_INFINITY });
            selected = nearMatch.index ? optionsList[nearMatch.index] : defaultValue;
        } 
        return selected ? selected : inputObject;
    }

    let clonedChildren = null;
    if (children) {
        clonedChildren = React.cloneElement(children, {filterWith: "testing"})
    }

    return (
        <>
            <object id={`select-${id}`} className={`input-control-base select-box${tiny ? " tiny" : ""}${label ? "" : " unlabeled"}`} style={inheritedStyles}>
                <div className={`select-container${expanded ? " expanded" : ""}`} onClick={() => handleClick()}>
                    <i className="drop-down-arrow">expand_more</i>
                    <input
                        id={id}
                        name={name}
                        className="select-input"
                        type="text"
                        defaultValue={defaultValue?.name}
                        // onClick={() => handleClick()}
                        onKeyDown={(e) => handleKeyDown(e)}
                        onChange={(e) => filterOptions(e.target.value)}
                        onMouseLeave={(e) => handleMouseOut(e)}
                        //onBlur={(e) => handleMouseOut(e)}
                        autoComplete="do-not-autofill"
                        data-deferupdate
                    />
                    <div className="option-set" style={dropDownStyle} onMouseLeave={(e) => handleMouseOut(e)}>
                        {
                            optionsList.map((option, i) => {
                                return <div key={i} className="select-option" onClick={() => optionSelected(option)} >{option.name}</div>
                            })
                        }
                    </div>
                </div>
                <label htmlFor={id} className="label" style={{top: "3px", left: "3px"}}>{label}</label>
            </object>
            {
                clonedChildren
            }
        </>
    )
}

export default SelectControl;