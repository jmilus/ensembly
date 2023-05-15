'use client'

import { useState, useEffect, useRef } from 'react';

import './Vstyling.css';

const CheckBox = (props) => {
    const { id, name, label, value=false, extraAction, shape=0, Vstyle, children, recordId, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value);

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        setControlValue(value)
    }, [value])

    const handleControlValueChange = (e) => {
        if (debug) console.log("updateForm value:", e.target.checked)
        if (extraAction) extraAction(e.target.checked);
        setControlValue(e.target.checked);
    }

    const checked = [
        <i>check_box</i>,
        <div className="check-button checked" ><div></div></div>
    ]

    const unchecked = [
        <i>check_box_outline_blank</i>,
        <div className="check-button"><div></div></div>
    ]

    return (
        <div className={`input-control-base checkbox${controlValue ? " checked" : ""}${readonly ? " readonly" : ""}`} style={Vstyle} >
            <label htmlFor={id} className="label">
                {controlValue ? checked[shape] : unchecked[shape] }
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