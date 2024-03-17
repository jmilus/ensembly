'use client'

import { useState, useEffect } from 'react';

import { HEXtoRGB, contrastColors } from '../../utils';

// import './Vstyling.css'

const Color = (props) => {
    const { id, name, value="#000000", extraAction, style, classes, icon, debug } = props;
    const [controlValue, setControlValue] = useState(value);

    useEffect(() => {
        setControlValue(value)
    }, [value])

    if(debug) console.log(id, controlValue, HEXtoRGB(controlValue, true))

    const handleControlValueChange = (value) => {
        if (extraAction) extraAction(value);
        setControlValue(value);
    }

    const [r, g, b] = HEXtoRGB(controlValue, true)

    let contrastColor = controlValue === 'transparent' ? 'black' : contrastColors([r, g, b]) ? 'black' : 'white';

    return (
        <div id={`color-${id}`} className={`color-swatch-base ${classes}`} style={{...style, backgroundColor: controlValue}}>
            <span style={{color: contrastColor}}>
                {icon}
            </span>
            <input
                id={id}
                className="color-input"
                type="color"
                name={name}
                value={controlValue}
                onChange={(e) => handleControlValueChange(e.target.value)}
                onDoubleClick={() => handleControlValueChange(defaultColor)}
            />
        </div>
    )
}

export default Color;