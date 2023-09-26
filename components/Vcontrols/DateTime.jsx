'use client'

import React, { useState, useEffect } from 'react';

import CALENDAR from '../../utils/calendarUtils';

// import './Vstyling.css';

const DateTime = (props) => {
    const { id, name, label, value, extraAction, max, min, style, hero, isRequired, includeTime, children, recordId, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value ? new Date(value) : "");

    const displayValue = controlValue ? CALENDAR.getDashedValue(controlValue).slice(0, includeTime ? 16 : 10) : "";

    if (debug) console.log(name, { props }, { controlValue }, { displayValue });

    useEffect(() => {
        setControlValue(value ? new Date(value) : "");
    }, [value])

    const handleControlValueChange = (input) => {
        console.log("new value:", input)
        const arrDate = input.slice(0, 10).split("-");
        const arrTime = input.slice(11).split(":")
        const newDate = new Date(arrDate[0], parseInt(arrDate[1]) - 1, arrDate[2], arrTime[0], arrTime[1]);
        if (extraAction) extraAction(newDate);
        setControlValue(newDate);
    }

    const handleDateChildren = () => {
        return React.Children.map(children, child => {

            let childValue;
            if (child.props.value) {
                childValue = new Date(controlValue).getTime() < new Date(child.props.value).getTime() ? child.props.value : controlValue;
            }
            
            return React.cloneElement(child, { value: childValue, min: displayValue, readonly: readonly }, child.props.children)
        })
    }
    
    const clonedDateChildren = handleDateChildren()

    return (
        <>
            <div id={`date-${id}`} className={`input-control-base date-box${label ? "" : " unlabeled"}${controlValue === "" ? " emptry" : ""}`} style={style}>
                <label htmlFor={name} className="label">{`${label} Date`}</label>
                <input
                    id={id}
                    value={displayValue}
                    type={props.includeTime ? "datetime-local" : "date"}
                    className=""
                    onChange={(e) => handleControlValueChange(e.target.value)}
                    max={max}
                    min={min}
                    required={isRequired}
                    autoComplete="do-not-autofill"
                    readOnly={readonly}
                />
                <input name={name} value={controlValue} style={{ display: "none" }} onChange={() => null} />
            </div>
            { clonedDateChildren }
        </>
    )

}

export default DateTime;