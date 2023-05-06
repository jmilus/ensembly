'use client'

import React, { useState, useEffect } from 'react';

import './Vstyling.css';

const Radio = (props) => {
    const { id, name, label, value, options, type, extraAction, Vstyle, isRequired = false, children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value);
    const [touched, setTouched] = useState(false);

    if (debug) console.log(name, { props }, { controlValue });

    useEffect(() => {
        if (extraAction) extraAction(controlValue);
    }, [controlValue])

    const handleControlValueChange = (v) => {
        setControlValue(v);
    }

    const handleBlur = () => {
        if(!touched) setTouched(true);
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            return React.cloneElement(child, { pattern: controlValue }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    return (
        <>
            <div id={`radio-${id}`} className={`radio-buttons-set ${type}${touched ? ' touched' : ''}`} style={Vstyle}>
                {
                    options.map((option, o) => {
                        return (
                            <div key={o} className="radio-option">
                                <input
                                    id={`${name}-${option}`}
                                    name={name}
                                    value={option}
                                    type="radio"
                                    className="radio-option"
                                    onChange={() => handleControlValueChange(option)}
                                    onBlur={() => handleBlur()}
                                    required={isRequired}
                                    readOnly={readonly}
                                />
                                <label htmlFor={`${name}-${option}`} className={`label${type === "filters" ? " tab-button" : ""}${controlValue === option ? " active" : ""}`}>
                                    <div className="radio-button"></div>
                                    {option}
                                </label>
                            </div>
                        )
                    })
                }
                

            </div>
            { clonedChildren }
        </>
    )
}

export default Radio;