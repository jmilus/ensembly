'use client'

import { useState, useEffect } from 'react';

// import './Vstyling.css';

const CheckBox = (props) => {
    const { id, name, label, value=false, extraAction, shape, style, children, recordId, readonly, debug } = props;
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
    
    let checkButton;
    switch (shape) {
        case "button":
            checkButton = <div className={`check-button ${controlValue ? "checked" : ""}`}><div></div></div>
            break;
        default:
            checkButton = <i>{controlValue ? "check_box" : "check_box_outline_blank"}</i>
            break;
    }

    return (
        <div className={`verdant-control checkbox${controlValue ? " checked" : ""}${readonly ? " readonly" : ""}`} style={style} >
            <label htmlFor={id} className="">
                {checkButton}
                <input
                    id={id}
                    type="checkbox"
                    checked={controlValue}
                    onChange={handleControlValueChange} 
                    readOnly={readonly}
                />
                {label}
            </label>
        </div>
    )
}

export default CheckBox;