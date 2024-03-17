'use client'

import React, { useState, useEffect } from 'react';
import { getDashedValue } from 'utils/calendarUtils';

// import './Vstyling.css';

const EditDateOnly = (props) => {
    const { id, name, label, value, extraAction, max, min, style, hero, isRequired, children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(getDashedValue(value, true) || "");

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        
        setControlValue(getDashedValue(value, true) || "");
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
            <div id={`date-${id}`} className={`verdant-control date-box date-only${label ? "" : " unlabeled"}${controlValue === "" ? " empty" : ""}`} style={style}>
                {label && <label htmlFor={name} >{`${label} Date`}</label>}
                <div className="hover-effect">
                    <input
                        id={id}
                        className="control-surface"
                        name={name}
                        value={controlValue}
                        type={"date"}
                        onChange={(e) => handleControlValueChange(e.target.value)}
                        max={max}
                        min={min}
                        required={isRequired}
                        autoComplete="do-not-autofill"
                        readOnly={readonly}
                    />
                </div>
            </div>
            { clonedDateChildren }
        </>
    )

}

const DateOnly = (props) => {
    const { id, label, value = "", style, hero, children, readonly } = props;

    if (!readonly) return <EditDateOnly {...props} />

    const dateArray = value.split("-")
    const displayDate = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));

    return (
        <>
            <div id={`dateonly-${id}`} className={`${hero ? " hero" : ""}`} style={style}>
                {label && <label htmlFor={id} >{label}</label>}
                <div style={{height: "2.75em", fontFamily: "arial", padding: "10px 15px", borderBottom: "1px solid var(--gray3)"}}>{displayDate.toDateString()}</div>
            </div>
            {children}
        </>
    )
}

export default DateOnly;