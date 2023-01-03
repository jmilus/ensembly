import React, { useState, useEffect } from 'react';

import CALENDAR from '../../utils/calendarUtils';

const DateTime = (props) => {
    const { id, field, label, value, initialValue, max, min, Vstyles=[null, null], hero, isRequired, children, recordId, updateForm, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value || initialValue);

    if (debug) console.log(field, { props }, { controlValue });

    useEffect(() => {
        if (new Date(min) > new Date(controlValue)) {
            handleControlValueChange(min)
        }
    }, [min])

    useEffect(() => {
        setControlValue(value);
    }, [value])

    const handleControlValueChange = (input) => {
        console.log("sending this to VForm:", input)
        if (updateForm) updateForm({ [field]: input }, recordId);
        setControlValue(new Date(input).toISOString());
    }

    const valueDate = new Date(controlValue);
    const displayDate = controlValue ? CALENDAR.getDashedDate(valueDate) : "";
    const displayTime = controlValue ? CALENDAR.get24Time(valueDate) : "";

    // console.log(label, "date/time values:", displayDate, "|", displayTime);

    const handleTimeChange = (time) => {
        const newDateTime = new Date(controlValue);
        newDateTime.setHours(time.slice(0, 2));
        newDateTime.setMinutes(time.slice(3, 5));
        newDateTime.setSeconds(time.slice(6, 8));

        handleControlValueChange(newDateTime);
    }

    const handleDateChange = (date) => {
        const newDateTime = new Date(controlValue);
        newDateTime.setFullYear(date.slice(0, 4));
        newDateTime.setMonth(date.slice(5, 7) - 1);
        newDateTime.setDate(date.slice(8, 10));

        handleControlValueChange(newDateTime);
    }

    const handleDateChildren = () => {
        return React.Children.map(children, child => {
            if (debug) console.log(field, child);
            let childValue;
            if (child.props.value) {
                const childDate = new Date(child.props.value)
                childValue = childDate >= valueDate ? childDate : valueDate;
            }
            if (debug) console.log({ childValue });
            
            return React.cloneElement(child, { min: controlValue, updateForm: updateForm, readonly: readonly }, child.props.children)
        })
    }
    
    const clonedDateChildren = handleDateChildren()

    return (
        <>
            <div id={`date-${id}`} className={`input-control-base date-box${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyles[0]}>
                <label htmlFor={field} className="label" style={{top: "3px", left: "3px"}}>{`${label} Date`}</label>
                <input
                    id={id}
                    field={field}
                    value={displayDate}
                    type="date"
                    className=""
                    onChange={(e) => handleDateChange(e.target.value)}
                    max={max}
                    min={CALENDAR.getDashedDate(min)}
                    required={isRequired}
                    autoComplete="do-not-autofill"
                    readOnly={readonly}
                />
            </div>
            {props.includeTime && 
                <div id={`date-${id}`} className={`input-control-base date-box${label ? "" : " unlabeled"} ${isRequired ? "flag" : ""}`} style={Vstyles[1]}>
                <label htmlFor={field} className="label" style={{top: "3px", left: "3px"}}>{`${label} Time`}</label>
                    <input
                        id={id}
                        field={field}
                        value={displayTime}
                        type="time"
                        className=""
                        onChange={(e) => handleTimeChange(e.target.value)}
                        max={max}
                        min={min}
                        required={isRequired}
                        autoComplete="do-not-autofill"
                        readOnly={readonly}
                    />
                </div>
            }
            {
                clonedDateChildren
            }
        </>
    );
}

export default DateTime;