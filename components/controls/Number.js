import { useState } from 'react';

import { floor } from 'lodash';

const Number = (props) => {
    const { id, field, label, value, initialValue, format, Vstyle, hero, isRequired, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue || 0);

    if (debug) console.log(field, { props }, { controlValue });

    const handleControlValueChange = (input) => {
        console.log("sending this to VForm:", input)
        if (updateForm) updateForm({ [field]: input }, recordId);
        setControlValue(parseInt(input));
    }

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
            default:
                handleControlValueChange(rawNumber);
                break;
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
            displayNumberValue = controlValue;
    }
    
    return (
        <div className={`input-control-base text-box${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyle}>
            <label htmlFor={id} className="label">{label}</label>
            <input
                id={id}
                field={field}
                value={displayNumberValue}
                type="text"
                className="text-input"
                onChange={(e) => handleNumberChange(e.target.value)}
                required={isRequired}
                autoComplete="do-not-autofill"
            />
        </div>
    );


}

export default Number;