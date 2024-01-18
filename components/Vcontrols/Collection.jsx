'use client'

import { packageOptions } from '../../utils';
import { useEvent } from 'hooks/useEvent';

import { useState, useRef, useEffect } from 'react';

import PopupMenu from 'components/PopupMenu';
// import './Vstyling.css';


const EditCollection = (props) => {
    const { id, name, label, value = [], options, extraAction, style, hero, isRequired, children, readonly, debug } = props;
    const [controlValues, setControlValues] = useState(packageOptions(value));
    const [matchString, setMatchString] = useState("")
    const [showPopup, setShowPopup] = useState(false);
    const collectorRef = useRef()
    const inputRef = useRef()
    const [selectRef, emitEvent] = useEvent('change', (e) =>
        console.log('Event fired', e, e.target)
    );

    let controlOptions = packageOptions(options, value)

    if (debug) console.log(id, { options },  {controlOptions}, { value }, { controlValues })

    const handleValueUpdate = (input) => {
        emitEvent(input)
        setMatchString("")
        setShowPopup(false)
        if(extraAction) extraAction(input)
        setControlValues(input)
    }

    const handleDropDownSelection = (input) => {
        let controlValuesCopy = { ...controlValues };
        controlValuesCopy[input] = controlOptions[input]
        console.log({controlValuesCopy})
        handleValueUpdate(controlValuesCopy)
    }

    const handleChange = (e) => {
        e.stopPropagation();
        setMatchString(e.target.value)
    }

    const handleKeys = (key) => {
        switch (key) {
            case "Escape":
                inputRef.current.blur();
            case "Tab":
                vanishPopup();
                break;
            default:
                break;
        }
    }

    const removeSelection = (optionKey) => {
        const controlValuesCopy = { ...controlValues }
        delete controlValuesCopy[optionKey]
        
        handleValueUpdate(controlValuesCopy);
    }

    const ItemNode = ({data}) => {
        // console.log({data})
    
        return (
            <div className={`node-wrapper ${data.extraClass ? data.extraClass : ""}`} style={data.extraStyle}>
                {data.icon && data.icon}
                <span>{data.caption}</span>
                {!readonly &&
                    <i onClick={() => removeSelection(data.value)}>cancel</i>
                }
            </div>
        )
    }

    return (
        <>
            <div ref={collectorRef} id={`collection-${id}`} className={`verdant-control collection-box ${Object.keys(controlValues).length > 0 ? "" : " empty"}`} style={style}>
                {label && <label htmlFor={id} >{label}</label>}
                <div className={`collection-container hover-effect${isRequired ? " required" : ""}`} style={{flex: 0}} >
                    {
                        Object.values(controlValues).map((option, i) => {
                            return <ItemNode key={i} data={option} />
                        })
                    }
                    {!readonly &&
                        <input
                            ref={inputRef}
                            id={`${id}-search`}
                            type="text"
                            className="control-surface collection-adder"
                            value={matchString}
                            style={{ background: "transparent", flex: 1 }}
                            onChange={(e) => handleChange(e)}
                            onKeyDown={(e) => handleKeys(e.key)}
                            onFocus={() => setShowPopup(true)}
                            placeholder={Object.keys(controlValues).length > 0 ? "" : label}
                        />
                    }
                </div>
                <select
                    ref={selectRef}
                    id={id}
                    name={name}
                    value={Object.keys(controlValues)}
                    onChange={() => null}
                    multiple={true}
                    required={isRequired}
                    readOnly={readonly}
                    style={{display: "none", height: "0px", overflow: "hidden"}}
                >
                    {
                        Object.values(controlOptions).map((item, i) => {
                            return <option key={i} id={item.id} value={item.value}></option>
                        })
                    }
                </select>
            </div>
            {showPopup && 
                <PopupMenu
                    parentRef={collectorRef}
                    hideMe={() => setShowPopup(false)}
                >
                    {
                        Object.keys(controlOptions).map((key, o) => {
                            const option = controlOptions[key];
                            console.log(option.caption)
                            if (!option.caption.toLowerCase().includes(matchString.toLowerCase())) return;
                            if (Object.keys(controlValues).includes(key)) return;
                            return (
                                <div key={o} id={option.id} className="select-option" style={{['--hover-color']: option.color ? `hsl(${option.color})` : 'var(--mint5)', padding: "10px 15px"}} onClick={(e) => handleDropDownSelection(key, e)}>
                                    {option.color && <div className="color-dot" style={{marginRight: "10px", backgroundColor: `hsl(${option.color})`}}></div>}
                                    <span style={{color: `hsl(${option.color})`}}>{option.caption && option.caption}</span>
                                </div>
                            )
                        })
                    }
                </PopupMenu>
            }
        </>
    )
}

const Collection = (props) => {
    const { id, label, value="", style, hero, children, readonly } = props;

    if (!readonly) return <EditCollection {...props} />

    const ItemNode = ({data}) => {
        console.log({ data })
        return (
            <div className={`node-wrapper ${data.extraClass ? data.extraClass : ""}`} style={data.extraStyle}>
                {data.icon && data.icon}
                <span>{data.name}</span>
            </div>
        )
    }

    return (
        <>
            <div id={`collection-${id}`} className={`${hero ? " hero" : ""}`} style={style}>
                <label htmlFor={id} >{label}</label>
                <div style={{ display: "flex", height: "3em", fontFamily: "arial", padding: "5px", borderBottom: "1px solid var(--gray3)" }}>
                    {
                        Object.values(value).map((option, i) => {
                            return <ItemNode key={i} data={option} />
                        })
                    }
                </div>
            </div>
            {children}
        </>
    )

}

export default Collection;