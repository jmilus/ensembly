'use client'

import { packageOptions } from '../../utils';

import { useState, useContext, useEffect } from 'react';

import { GlobalContext } from '../ContextFrame';
import './Vstyling.css';


const Collection = (props) => {
    const { id, name, label, value = [], options, extraAction, style, hero, isRequired, children, readonly, debug } = props;
    const [controlValues, setControlValues] = useState({})
    const [searchStr, setSearchStr] = useState("")

    useEffect(() => {
        setControlValues(packageOptions(value))
    }, [value])

    useEffect(() => {
        setSearchStr("")
    }, [controlValues])

    let controlOptions = packageOptions(options, value)

    if (debug) console.log({ options }, { controlValues }, { value }, {controlOptions})

    const { dispatch } = useContext(GlobalContext);

    const handleValueUpdate = (input) => {
        const selectControl = document.getElementById(id)
        const inputEvent = new Event('change', { bubbles: true });
        selectControl.dispatchEvent(inputEvent);

        setControlValues(input)
    }

    const handleDropDownSelection = (input) => {
        dispatch({ route: "dropdown", payload: null })
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
        
        dispatch({
            route: "dropdown",
            payload: {
                dim: { x: parentControl.offsetLeft, y: parentControl.offsetTop, h: parentControl.offsetHeight, w: parentControl.offsetWidth },
                options: valuesToShow,
                value: Object.values(controlValues).map(cv => cv.id),
                setSelectControlValue: handleDropDownSelection
            }
        })
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
            <div id={`collection-${id}`} className="input-control-base collection-box" style={style}>
                {label && <label htmlFor={id} className={`label ${Object.keys(controlValues).length > 0 ? "" : "hide"}`}>{label}</label>}
                <select
                    id={id}
                    name={name}
                    value={Object.keys(controlValues)}
                    onChange={() => null}
                    multiple={true}
                    required={isRequired}
                    readOnly={readonly}
                    style={{display: "none"}}
                >
                    {
                        Object.values(controlOptions).map((item, i) => {
                            return <option key={i} id={item.id} value={item.value}></option>
                        })
                    }
                </select>
                <div className="collection-container" >
                    {
                        Object.values(controlValues).map((option, i) => {
                            return <ItemNode key={i} data={option} />
                        })
                    }
                    <input type="text" className="collection-adder" value={searchStr} onClick={(e) => showDropDown(e)} onChange={(e) => showDropDown(e)} placeholder={Object.keys(controlValues).length > 0 ? "" : label} />
                </div>
            </div>
        </>
    )
}

export default Collection;