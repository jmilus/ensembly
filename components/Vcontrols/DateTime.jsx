'use client'

import React, { useState, useEffect } from 'react';

import CALENDAR from '../../utils/calendarUtils';

// import './Vstyling.css';

const EditDateTime = (props) => {
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
            <div id={`date-${id}`} className={`verdant-control date-box${label ? "" : " unlabeled"}${controlValue === "" ? " emptry" : ""}`} style={style}>
                {label && <label htmlFor={name} >{`${label} Date`}</label>}
                <div className="hover-effect">
                    <input
                        id={id}
                        className="control-surface"
                        value={displayValue}
                        type={props.includeTime ? "datetime-local" : "date"}
                        onChange={(e) => handleControlValueChange(e.target.value)}
                        max={max}
                        min={min}
                        required={isRequired}
                        autoComplete="do-not-autofill"
                        readOnly={readonly}
                    />
                    <input name={name} value={controlValue} style={{ display: "none" }} onChange={() => null} />
                </div>
            </div>
            { clonedDateChildren }
        </>
    )

}

const DateTime = (props) => {
    const { id, label, value = "", style, hero, children, readonly } = props;

    if (!readonly) return <EditDateTime {...props} />

    console.log({ value })
    const tz = new Date().getTimezoneOffset() / 60;
    console.log({tz})
    const [date, time] = value.split("T")
    const dateArray = date.split("-")
    const timeArray = time.split(":")
    console.log({ dateArray }, { timeArray })
    const displayDate = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]), parseInt(timeArray[0]) - tz, parseInt(timeArray[1]));
    console.log({ displayDate })
    return (
        <>
            <div id={`dateonly-${id}`} className={`${hero ? " hero" : ""}`} style={style}>
                {label && <label htmlFor={name} >{`${label} Date`}</label>}
                <div style={{height: "3em", fontFamily: "arial", padding: "10px 15px", borderBottom: "1px solid var(--gray3)"}}>{`${displayDate.toDateString()} ${displayDate.toLocaleTimeString()}`}</div>
            </div>
            {children}
        </>
    )
}

export default DateTime;