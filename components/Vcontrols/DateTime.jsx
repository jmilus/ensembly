'use client'

import React, { useState, useEffect } from 'react';

import CALENDAR from '../../utils/calendarUtils';

import './Vstyling.css';

const DateTime = (props) => {
    const { id, name, label, value, extraAction, max, min, Vstyles=[null, null], hero, isRequired, includeTime, children, recordId, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(new Date(value));
    const [touched, setTouched] = useState(false);

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        if (extraAction) extraAction(controlValue);
    }, [controlValue])

    useEffect(() => {
        setControlValue(new Date(value));
    }, [value])

    const handleControlValueChange = (input) => {
        // console.log("new value:", new Date(input))
        setControlValue(new Date(input));
    }

    const displayValue = CALENDAR.getDashedValue(controlValue).slice(0, includeTime ? 16 : 10);

    if (debug) console.log(name, { controlValue }, {displayValue});

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
            <div id={`date-${id}`} className={`input-control-base date-box${label ? "" : " unlabeled"}${touched ? " touched" : ""}`} style={Vstyles[0]}>
                <label htmlFor={name} className="label" style={{top: "3px", left: "3px"}}>{`${label} Date`}</label>
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