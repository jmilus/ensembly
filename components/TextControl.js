import {useState, useEffect, useRef} from 'react'

import { floor } from 'lodash';

const TextField = ({ id, name, label, initialValue, inheritedStyles, hero, isRequired }) => {
    const [labelMode, setLabelMode] = useState(initialValue != "" ? "out" : "in");
    const labelTop = labelMode === "in" ? "31px" : "3px";
    const labelLeft = labelMode === "in" ? "10px" : "3px";

    return (
        <object className={`input-control-base text-box${hero ? " hero" : ""}${label ? "" : " unlabeled"}`} style={inheritedStyles}>
            <input
                id={id}
                name={name}
                type="text"
                defaultValue={initialValue}
                className="text-input"
                onFocus={() => setLabelMode("out")}
                onBlur={(e) => setLabelMode(e.target.value === "" ? "in" : "out")}
                required={isRequired}
                autoComplete="do-not-autofill"
            />
            <label htmlFor={id} className="label" style={{top: labelTop, left: labelLeft}}>{label}</label>
        </object>
    )
}

const NumberBox = ({ id, name, label, initialValue=0, inheritedStyles, units }) => {
    const [realValue, setRealValue] = useState(initialValue);
    const [displayValue, setDisplayValue] = useState();
    const validateTimer = useRef(null);

    useEffect(() => {
        const setupValues = async () => {
            setDisplayValue(formatNumber(realValue));
        }
        setupValues();
    }, [])
    
    const formatNumber = (number) => {
        switch (units) {
            case "imperial-length":
                return `${floor(number / 12)}' ${number % 12}"`
            case "imperial-weight":
                return `${number} lbs`
            default:
                return number;
                break;
        }
    }

    const handleChange = (event) => {
        if (validateTimer.current) {
            clearTimeout(validateTimer.current);
            validateTimer.current = null;
        }
        const input = event.target.value;
        setDisplayValue(input);
        validateTimer.current = setTimeout(() => {
            const validatedValue = validateValue(input);
            setRealValue(validatedValue);
        }, 1500);
    }


    const validateValue = (input) => {
        if (input == null) return 0;
        let validatedValue = input;
        switch (units) {
            case "imperial-length":
                let feet, inches = undefined;

                const ftSep = input.indexOf(`'`);
                const inSep = input.indexOf(`"`);
                if (ftSep >= 0) {
                    if (inSep >= 0) {
                        if (inSep > ftSep) {
                            feet = parseInt(input.slice(0, ftSep).replace(/[^0-9]*/gm, ''));
                            inches = parseInt(input.slice(ftSep, inSep).replace(/[^0-9]*/gm, ''));
                        } else {
                            feet = parseInt(input.slice(inSep, ftSep).replace(/[^0-9]*/gm, ''));
                            inches = parseInt(input.slice(0, inSep).replace(/[^0-9]*/gm, ''));
                        }
                    } else {
                        inches = parseInt(input.slice(ftSep).replace(/[^0-9]*/gm, ''));
                    }
                } else {
                    if (inSep >= 0) {
                        inches = parseInt(input.slice(0, inSep).replace(/[^0-9]*/gm, ''));
                    } else {
                        feet = parseInt(input.replace(/[^0-9]*/gm, ''));
                    }
                }

                feet = Number.isInteger(feet) ? feet : 0;
                inches = Number.isInteger(inches) ? inches : 0;

                validatedValue = (feet * 12) + inches;
                
                break;
            case "imperial-weight":
                let weight = undefined;
                const marker = input.indexOf('lbs');
                if (marker >= 0) {
                    weight = parseInt(input.slice(0, marker).replace(/[^0-9]*/gm, ''));
                }
                console.log({weight})
                validatedValue = Number.isInteger(weight) ? weight : realValue;
                    
            default:
                break;
        }
        
        return validatedValue;
    }
    
    return (
        <object className={`input-control-base text-box${label ? "" : " unlabeled"}`} style={inheritedStyles}>
            <input
                id={id}
                name={name}
                type="text"
                defaultValue={displayValue}
                onChange={(e) => handleChange(e)}
                className="text-input"
                data-realvalue={realValue}
                autoComplete="do-not-autofill"
            />
            <label htmlFor={id} className="label" style={{top: "3px", left: "3px"}}>{label}</label>
        </object>
    )
}



const TextControl = (props) => {
    switch (props.type) {
        case "text":
            return TextField(props);
        case "number":
            return NumberBox(props);
        default:
            return <div>InputType Not Provisioned</div>
    }
}

export default TextControl;