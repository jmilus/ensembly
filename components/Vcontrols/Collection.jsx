'use client'

import { packageOptions } from '../../utils';

import { useState, useRef, useEffect } from 'react';

import PopupMenu from 'components/PopupMenu';
// import './Vstyling.css';


const Collection = (props) => {
    const { id, name, label, value = [], options, extraAction, style, hero, isRequired, children, readonly, debug } = props;
    const [controlValues, setControlValues] = useState(packageOptions(value))
    const [searchStr, setSearchStr] = useState("")
    const [showPopup, setShowPopup] = useState(false);
    const collectorRef = useRef()

    useEffect(() => {
        setSearchStr("")
        if(extraAction) extraAction(controlValues)
    }, [controlValues])

    let controlOptions = packageOptions(options, value)

    if (debug) console.log({ options },  {controlOptions}, { value }, { controlValues })

    const handleValueUpdate = (input) => {
        const inputEvent = new Event('change', { bubbles: true });
        collectorRef.current.dispatchEvent(inputEvent);
        setShowPopup(false)
        setControlValues(input)
    }

    const handleDropDownSelection = (input) => {
        let controlValuesCopy = { ...controlValues };
        controlValuesCopy[input] = controlOptions[input]
        console.log({controlValuesCopy})
        handleValueUpdate(controlValuesCopy)
    }

    const removeSelection = (optionKey) => {
        const controlValuesCopy = { ...controlValues }
        delete controlValuesCopy[optionKey]
        
        handleValueUpdate(controlValuesCopy);
    }

    const showDropDown = (e) => {
        e.stopPropagation();
        const str = e.target.value
        setSearchStr(str);
        if (readonly) return null;
        const parentControl = document.getElementById(`collection-${id}`)
        const valuesToShow = { ...controlOptions }
        if (str != "") {
            Object.keys(controlOptions).forEach(val => {
                if (!controlOptions[val].caption.toLowerCase().includes(str.toLowerCase()))
                    delete valuesToShow[val]
            })
        }
        
        setShowPopup(true);
        return false;
    }

    const ItemNode = ({data}) => {
        // console.log({data})
    
        return (
            <div className={`node-wrapper ${data.extraClass ? data.extraClass : ""}`} style={data.extraStyle}>
                {data.icon && data.icon}
                <span>{data.caption}</span>
                <i onClick={() => removeSelection(data.value)}>cancel</i>
            </div>
        )
    }

    return (
        <>
            <div id={`collection-${id}`} className={`input-control-base collection-box ${Object.keys(controlValues).length > 0 ? "" : " empty"}`} style={style}>
                {label && <label htmlFor={id} className="label">{label}</label>}
                <div className={`collection-container${isRequired ? " required" : ""}`} >
                    {
                        Object.values(controlValues).map((option, i) => {
                            return <ItemNode key={i} data={option} />
                        })
                    }
                    <input type="text" className="collection-adder" value={searchStr} style={{background:"transparent"}} onClick={(e) => showDropDown(e)} onChange={(e) => showDropDown(e)} placeholder={Object.keys(controlValues).length > 0 ? "" : label} />
                </div>
                <select
                    ref={collectorRef}
                    id={id}
                    name={name}
                    value={Object.keys(controlValues)}
                    onChange={() => null}
                    multiple={true}
                    required={isRequired}
                    readOnly={readonly}
                    style={{height: "0px", overflow: "hidden"}}
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

export default Collection;