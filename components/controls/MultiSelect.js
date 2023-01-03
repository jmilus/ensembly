import React, { useState, useEffect } from 'react';

import { packageOptions } from '../../utils';

const MultiSelect = (props) => {
    const { id, field, label, value, initialValue, options, foptions, filtersArray = [], Vstyle, hero, isRequired, tiny, children, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);
    const optionsArray = foptions ? foptions : packageOptions(options);
    const [expanded, setExpanded] = useState(false);
    const [displayOptions, setDisplayOptions] = useState([]);

    if (debug) console.log(field, { props }, { controlValue }, { displayOptions });

    const prepOptions = (options) => {
        const preppedOptions = options.map(option => {
            const isSelected = controlValue.find(cv => {
                return cv === option.value;
            })
            if (isSelected != undefined) return { ...option, selected: true }
            return { ...option, selected: false }
        })

        setDisplayOptions(preppedOptions);
    }


    useEffect(() => {
        if (foptions) {
            prepOptions(foptions);
        } else {
            prepOptions(options);
        }
    }, [foptions])

    const handleControlValueChange = (input) => {
        // console.log({ input })
        prepOptions(displayOptions.map(dop => {
            if (input.id === dop.id) return { ...dop, selected: input.selected }
            return { ...dop }
        }))

        const valueArray = [];
        if (input.selected) {
            valueArray = [ ...controlValue ];
            valueArray.push(input.value);
        } else {
            valueArray = controlValue.filter(cv => {
                return cv != input.value;
            })
        }
        valueArray.sort((a, b) => a-b)
        if (updateForm) updateForm({ [field]: valueArray }, recordId);
        setControlValue(valueArray);
    }

    

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

    const handleMouseOut = (event) => {
        const selectObject = document.getElementById(`select-${id}`);
        if (event.relatedTarget && event.relatedTarget.className) {
            if (selectObject.compareDocumentPosition(event.relatedTarget) === 20) {
                return null;
            }
        }
        setExpanded(false);
    }

    const setDisplaySelectedOptions = () => {
        return controlValue.map(cv => {
            return displayOptions.find(disp => disp.value === cv)?.short
        }).join(", ");
    }
    const displaySelectValue = setDisplaySelectedOptions();

    const selectOption = (option) => {
        option.selected = !option.selected;
        handleControlValueChange(option);
    }

    return (
        <>
            <div id={`select-${id}`} className={`input-control-base select-box${tiny ? " tiny" : ""}${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyle}>
                <label htmlFor={id} className="label" style={{ top: "3px", left: "3px" }}>{label}</label>
                <div className={`select-container${expanded ? " expanded" : ""}`} onClick={() => setExpanded(!expanded)}>
                    { !readonly && <i className="drop-down-arrow">expand_more</i> }
                    <input
                        id={id}
                        field={field}
                        defaultValue={displaySelectValue}
                        className="select-input"
                        type="text"
                        // onKeyDown={(e) => handleSelectKeyDown(e)}
                        // onChange={(e) => handleSelectChange(e.target.value)}
                        onMouseLeave={(e) => handleMouseOut(e)}
                        autoComplete="do-not-autofill"
                        required={isRequired}
                        readOnly={readonly}
                    />
                    { !readonly &&
                        <div className="option-set" onMouseLeave={(e) => handleMouseOut(e)}>
                            {
                                displayOptions.map((option, i) => {
                                    return <div key={i} className={`select-option${option.selected ? " selected" : ""}`} onClick={() => selectOption(option)} >{option.name}</div>
                                })
                            }
                        </div>
                    }
                </div>
            </div>
            {
                clonedChildren
            }
        </>
    );

}

export default MultiSelect;