'use client'

import { useState, useEffect, useRef } from 'react';

import './Vstyling.css';

const CheckBox = (props) => {
    const { id, name, label, value, extraAction, initialValue, Vstyle, children, recordId, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        if (extraAction) extraAction(controlValue);
    }, [controlValue])

    const handleControlValueChange = (e) => {
        console.log("updateForm value:", e.target.checked)
        setControlValue(e.target.checked);
    }

    return (
        <div className={`input-control-base checkbox${controlValue ? " checked" : ""}${readonly ? " readonly" : ""}`} style={Vstyle} >
            <label htmlFor={id} className="label">
                {controlValue ? <i>check_box</i> : <i>check_box_outline_blank</i>}
                <input
                    id={id}
                    type="checkbox"
                    checked={controlValue}
                    onChange={handleControlValueChange} 
                    readOnly={readonly} />
                {label}
            </label>
        </div>
    )
}

export default CheckBox;