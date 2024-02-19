'use client'

import React, { useState, useEffect } from 'react';

import { validateEmail } from 'utils';

// import './Vstyling.css';

const EditText = (props) => {
    const { id, name, label, value="", placeholder, extraAction, format, limit, style, innerStyle, hero, isRequired=false, children, pattern, clear, readonly, validateOnBlur=false, validationFunction, debug } = props;
    const [controlValue, setControlValue] = useState(value === null ? "" : value)

    if (debug) console.log(name, { props }, { controlValue });

    let isValid = true;
    if (format === "email") isValid = controlValue != "" ? validateEmail(controlValue) : true;

    useEffect(() => {
        setControlValue(value === null ? "" : value);
    }, [value])

    let textType;
    switch (format) {
        case "date":
        case "phone":
        case "phonenumber":
            textType = "text"
            break;
        case "email":
            textType = "email"
            break;
        default:
            textType = format
    }

    const formatDate = (d) => {
        const dateNums = d.split("-");
        let year = dateNums[0]
        let month = dateNums[1].padStart(2, "0")
        let day = dateNums[2].padStart(2, "0")

        if (year === "") {
            year = "0000"
        } else {
            if (year.length > 4) year = year.substr(-4)
            let yearInt = parseInt(year)
            if (year.length < 4) yearInt += 2000
            if (yearInt > new Date().getFullYear()) yearInt = yearInt - 100
            year = yearInt.toString()
        }
        
        return `${year}-${month}-${day}`
    }

    function formatValue(v) {
        if (v === null) return ""
        let workingValue = v.toString();

        switch (format) {
            case "phone":
            case "phonenumber":
                workingValue = workingValue.replace(/[^0-9]*/gm, '');
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
            case "email":
            default:
                workingValue = v;
                break;
        }
        
        return workingValue;
    }

    const handleControlValueChange = (input) => {
        // console.log(input)
        if (extraAction && !validateOnBlur) extraAction(input);
        setControlValue(input);
    }

    const handleBlur = (e) => {
        if (validateOnBlur) {
            const validation = validationFunction(controlValue)
            if (extraAction) extraAction(validation[0]);
        }
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            return React.cloneElement(child, { pattern: controlValue }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    const clearbutton = clear && <i id={`${id}-clear-button`} className={`input-clear-button${controlValue ? " show" : ""}`} onClick={() => handleControlValueChange("")}>close</i>

    const displayValue = formatValue(controlValue)

    const inputProps = {
        id,
        name,
        value: displayValue,
        placeholder: placeholder || label,
        type: textType,
        className: `control-surface text-input${clear ? " clearable" : ""}${isValid ? "" : " not-valid"}`,
        style: innerStyle,
        onChange: (e) => handleControlValueChange(e.target.value),
        onBlur: handleBlur,
        required: isRequired,
        autoComplete: "do-not-autofill",
        maxLength: limit,
        readOnly: readonly,
        pattern
    }

    const inputControl = limit > 100
        ? <textarea
            {...inputProps}
        />
        : <input
            {...inputProps}
        />
    return (
        <>
            <div id={`text-${id}`} className={`verdant-control text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}${clear ? " clearable-control" : ""}${controlValue === "" ? " empty" : ""}`} style={style}>
                {label && <label htmlFor={id} >{label}</label>}
                <div className="hover-effect">
                    {inputControl}
                    {controlValue != "" && clearbutton}
                </div>
            </div>
            {clonedChildren}
        </>
    );
}

const Text = (props) => {
    const { id, label, value="", style, hero, children, readonly } = props;

    if (!readonly) return <EditText {...props} />

    return (
        <>
            <div id={`text-${id}`} className={`text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}${value === "" ? " empty" : ""}`} style={style}>
                {label && <label htmlFor={id} >{label}</label>}
                <div style={{height: "3em", fontFamily: "arial", padding: "10px 15px", borderBottom: "1px solid var(--gray3)"}}>{value}</div>
            </div>
            {children}
        </>
    )

}
    

export default Text;