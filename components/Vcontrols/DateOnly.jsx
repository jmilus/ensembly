'use client'

import React, { useState, useEffect } from 'react';

import './Vstyling.css';

const DateOnly = (props) => {
    const { id, name, label, value, extraAction, max, min, style, hero, isRequired, children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || "");

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        setControlValue(value || "");
    }, [value])

    const handleControlValueChange = (input) => {
        console.log("new value:", input)
        if (extraAction) extraAction(input);
        setControlValue(input);
    }

    const handleDateChildren = () => {
        return React.Children.map(children, child => {

            let childValue;
            if (child.props.value) {
                childValue = new Date(controlValue).getTime() < new Date(child.props.value).getTime() ? child.props.value : controlValue;
            }
            
            return React.cloneElement(child, { value: childValue, min: controlValue, readonly: readonly }, child.props.children)
        })
    }
    
    const clonedDateChildren = handleDateChildren()

    return (
        <>
            <div id={`date-${id}`} className={`input-control-base date-only-box${label ? "" : " unlabeled"}`} style={style}>
                <label htmlFor={name} className="label">{`${label} Date`}</label>
                <input
                    id={id}
                    name={name}
                    value={controlValue}
                    type={"date"}
                    className=""
                    onChange={(e) => handleControlValueChange(e.target.value)}
                    max={max}
                    min={min}
                    required={isRequired}
                    autoComplete="do-not-autofill"
                    readOnly={readonly}
                />
            </div>
            { clonedDateChildren }
        </>
    )

}

export default DateOnly;