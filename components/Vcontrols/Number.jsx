'use client'

import { useState, useEffect, useRef } from 'react';

import { floor } from 'lodash';

import './Vstyling.css';

const Number = (props) => {
    const { id, name, label, value, extraAction, initialValue, format, style, hero, isRequired, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue || 0);
    const [touched, setTouched] = useState(false);

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        if (extraAction) extraAction(controlValue);
    }, [controlValue])

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

        setControlValue(finalValue);
    }

    const handleBlur = () => {
        if(!touched) setTouched(true);
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
            displayNumberValue = controlValue;
    }
    
    return (
        <div className={`input-control-base number-box${label ? "" : " unlabeled"}${touched ? " touched" : ""}`} style={style}>
            <label htmlFor={id} className="label">{label}</label>
            <input
                id={id}
                value={displayNumberValue}
                type="text"
                className="number-input"
                onChange={(e) => handleControlValueChange(e.target.value)}
                onBlur={handleBlur}
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
    );


}

export default Number;