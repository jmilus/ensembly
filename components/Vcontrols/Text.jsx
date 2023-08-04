'use client'

import React, { useState, useEffect, useRef } from 'react';

import './Vstyling.css';

const Text = (props) => {
    const { id, name, label, value="", placeholder, extraAction, format, limit, style, hero, isRequired=false, children, pattern, clear, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value === null ? "" : value)

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        setControlValue(value === null ? "" : value);
    }, [value])

    let textType;
    switch (format) {
        case "phone":
            textType = "text"
            break;
        default:
            textType = format
    }

    const handleControlValueChange = (input) => {
        let workingValue;
        switch (format) {
            case "phone":
                workingValue = input.replace(/[^0-9]*/gm, '');
                if (workingValue?.length > 4) {
                    if (workingValue.length > 7) {
                        if (workingValue.length >= 10) {
                            if (workingValue.length > 10) {
                                workingValue = "+" + workingValue.slice(0, -10) + " " + workingValue.slice(-10);
                            }
                            workingValue = workingValue.slice(0, -10) + "(" + workingValue.slice(-10);
                        }
                        workingValue = workingValue.slice(0, -7) + ") " + workingValue.slice(-7);
                    }
                    workingValue = workingValue.slice(0, -4) + "-" + workingValue.slice(-4);
                }
                break;
            default:
                workingValue = input;
                break;
        }
        if (extraAction) extraAction(workingValue);
        setControlValue(workingValue);
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            return React.cloneElement(child, { pattern: controlValue }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    const clearbutton = clear && <i id={`${id}-clear-button`} className={`input-clear-button${controlValue ? " show" : ""}`} onClick={() => handleControlValueChange("")}>close</i>

    const inputControl = limit > 100
        ? <textarea
            id={id}
            name={name}
            value={controlValue}
            placeholder={placeholder || label}
            type="text"
            className="text-input"
            onChange={(e) => handleControlValueChange(e.target.value)}
            required={isRequired}
            autoComplete="do-not-autofill"
            maxLength={limit}
            readOnly={readonly}
        />
        : <input
            id={id}
            name={name}
            value={controlValue}
            placeholder={placeholder || label}
            type={textType}
            className={`text-input${clear ? " clearable" : ""}`}
            onChange={(e) => handleControlValueChange(e.target.value)}
            required={isRequired}
            autoComplete="do-not-autofill"
            maxLength={limit}
            readOnly={readonly}
            pattern={pattern}
        />
    return (
        <>
            <div id={`text-${id}`} className={`input-control-base text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}${clear ? " clearable-control" : ""}`} style={style}>
                <label htmlFor={id} className={`label ${controlValue === "" ? "hide" : ""}`}>{label}</label>
                {inputControl}
                {controlValue != "" && clearbutton}
            </div>
            {clonedChildren}
        </>
    );
}

export default Text;