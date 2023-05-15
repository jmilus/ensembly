'use client'

import React, { useState, useEffect } from 'react';

import { packageOptions } from '../../utils';

import './Vstyling.css';

const Radio = (props) => {
    const { id, name, label, value, options, type="default", extraAction, Vstyle, isRequired = false, children, readonly, debug } = props;
    const [controlValue, setControlValue] = useState(value);
    const [sliderPosition, setSliderPosition] = useState(options.findIndex(op => op.name === value) || 0);

    const packagedOptions = packageOptions(options, value);
    const optionsCount = Object.keys(packagedOptions).length;

    if (debug) console.log(name, { props }, { controlValue });

    const handleControlValueChange = (v, o) => {
        if (extraAction) extraAction(v);
        if(type === "slider") setSliderPosition(o)
        setControlValue(v.value);
    }

    const handleChildren = () => {
        return React.Children.map(children, child => {
            return React.cloneElement(child, { pattern: controlValue.value }, child.props.children)
        })
    }

    const clonedChildren = handleChildren();

    return (
        <>
            <div id={`radio-${id}`} className={`radio-buttons-set ${type}`} onChange={(e) => console.log(e)} style={{...Vstyle, flex: optionsCount}}>
                {
                    Object.values(packagedOptions).map((option, o) => {
                        return (
                            <div key={o} className="radio-option">
                                <input
                                    id={`${name}-${id}-${o}`}
                                    name={`${name}-${id}`}
                                    value={option.value}
                                    type="radio"
                                    onChange={() => handleControlValueChange(option, o)}
                                    required={isRequired}
                                    readOnly={readonly}
                                />
                                <label htmlFor={`${name}-${id}-${o}`} className={`label${controlValue === option.value ? " active" : ""}`}>
                                    <div className={`radio-button ${type}`}></div>
                                    {type === "default" && option.name}
                                </label>
                            </div>
                        )
                    })
                }
                {type === "slider" && 
                    <div className={`radio-slider ${controlValue}`} style={{ width: `${100 / optionsCount}%`, left: `${(100 / optionsCount) * sliderPosition}%` }} >
                        {controlValue}
                    </div>
                }

            </div>
            { clonedChildren }
        </>
    )
}

export default Radio;