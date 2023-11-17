'use client'

import { useState, useEffect, useRef } from 'react';

import { floor } from 'lodash';

// import './Vstyling.css';

const formatNumber = (format, controlValue) => {
    let displayNumberValue = 0
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
            displayNumberValue = controlValue;
    }
    return displayNumberValue;
}

const EditNumber = (props) => {
    const { id, name, label, value, extraAction, format, style, hero, isRequired, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || 0);

    if (debug) console.log(name, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        const rawNumber = input.replace(/[^0-9]*/gm, '');
        let finalValue;

        switch (format) {
            case "weight":
                finalValue = parseInt(rawNumber);
                break;
            case "height":
                let inches = parseInt(rawNumber.slice(-2));
                let feet = rawNumber.slice(0, -2);
                if (inches > 11) {
                    feet = feet + rawNumber.slice(-2, -1);
                    inches = parseInt(rawNumber.slice(-1));
                }
                finalValue = (feet * 12) + inches;
                break;
            default:
                finalValue = rawNumber;
                break;
        }
        if (extraAction) extraAction(finalValue);
        setControlValue(finalValue);
    }

    let displayNumberValue = formatNumber(format, controlValue);
    
    return (
        <div id={`number-${id}`} className={`verdant-control number-box${label ? "" : " unlabeled"}${controlValue === 0 ? " empty" : ""}`} style={style}>
            <label htmlFor={id} >{label}</label>
            <div className="hover-effect">
                <input
                    id={id}
                    className="control-surface number-input"
                    value={displayNumberValue}
                    type="text"
                    onChange={(e) => handleControlValueChange(e.target.value)}
                    required={isRequired}
                    autoComplete="do-not-autofill"
                    readOnly={readonly}
                />
                <input
                    name={name}
                    value={controlValue}
                    onChange={() => console.log("")}
                    style={{ display: "none" }}
                    readOnly={readonly}
                />
            </div>
        </div>
    );


}

const Number = (props) => {
    const { id, label, value = "", format, style, hero, children, readonly } = props;

    if (!readonly) return <EditNumber {...props} />

    let displayNumberValue = formatNumber(format, value);

    return (
        <>
            <div id={`number-${id}`} className={`number-box ${hero ? " hero" : ""}`} style={style}>
                <label htmlFor={id} >{label}</label>
                <div style={{height: "3em", fontFamily: "arial", padding: "10px 15px", borderBottom: "1px solid var(--gray3)", textAlign: "right"}}>{displayNumberValue}</div>
            </div>
            {children}
        </>
    )
}

export default Number;