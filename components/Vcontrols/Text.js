import React, { useState, useEffect, useRef } from 'react';

const Text = (props) => {
    const { id, name, label, value, extraAction, format, initialValue="", limit, Vstyle, hero, isRequired=false, children, pattern, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);
    const [touched, setTouched] = useState(false);

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        if (extraAction) extraAction(controlValue);
    }, [controlValue])

    let textType;
    switch (format) {
        case "phone":
            textType = "text"
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
        setControlValue(workingValue);
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            return React.cloneElement(child, { pattern: controlValue }, child.props.children)
        })
    }

    const handleBlur = () => {
        if(!touched) setTouched(true);
    }

    const clonedChildren = handleChildren();

    const inputControl = limit > 100
        ? <textarea
            id={id}
            name={name}
            value={controlValue}
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
            placeholder={label}
            type={textType}
            className="text-input"
            onChange={(e) => handleControlValueChange(e.target.value)}
            onBlur={handleBlur}
            required={isRequired}
            autoComplete="do-not-autofill"
            maxLength={limit}
            readOnly={readonly}
            pattern={pattern}
        />
    return (
        <>
            <div id={`text-${id}`} className={`input-control-base text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}${touched ? " touched" : ""}`} style={Vstyle}>
                <label htmlFor={id} className={`label ${controlValue === "" ? "hide" : ""}`}>{label}</label>
                {inputControl}
            </div>
            { clonedChildren }
        </>
    );
}

export default Text;