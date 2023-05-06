'use client'

import { packageOptions } from '../../utils';

import { useState, useContext } from 'react';

import { GlobalContext } from '../ContextFrame';
import './Vstyling.css';


const Collection = (props) => {
    const { id, name, label, value, options, filtersArray = [], extraAction, Vstyle, hero, isRequired, children, readonly, debug } = props;
    const [controlValues, setControlValues] = useState(value || [])

    let controlOptions = packageOptions(options, value)

    console.log({controlValues})

    const { dispatch } = useContext(GlobalContext);

    const handleValueUpdate = (input) => {
        const selectControl = document.getElementById(id)
        const inputEvent = new Event('change', { bubbles: true });
        selectControl.dispatchEvent(inputEvent);

        setControlValues(input)
    }

    const handleDropDownSelection = (input) => {
        dispatch({ route: "dropdown", payload: null })
        let controlValuesCopy = [...controlValues];
        controlValuesCopy.push(input.value)
        console.log({controlValuesCopy})
        handleValueUpdate(controlValuesCopy)
    }

    const removeSelection = (id) => {
        const valuesCopy = [ ...controlValues ]
        valuesCopy.forEach(val => {
            if (val.id === id) val.selected = false;
        })
        handleValueUpdate(valuesCopy);
    }

    const showDropDown = (str) => {
        if (readonly) return null;
        const parentControl = document.getElementById(`collection-${id}`)
        const valuesToShow = str ? Object.values(controlOptions).filter(val => val.name.toLowerCase().includes(str.toLowerCase())) : Object.values(controlOptions)
        console.log({valuesToShow})
        dispatch({
            route: "dropdown",
            payload: {
                dim: { x: parentControl.offsetLeft, y: parentControl.offsetTop, h: parentControl.offsetHeight, w: parentControl.offsetWidth },
                options: valuesToShow,
                setSelectControlValue: handleDropDownSelection
            }
        })
    }

    const ItemNode = ({data}) => {
        // console.log({data})
        return (
            <div className="node-wrapper">
                {data.icon && data.icon}
                <span>{data.name}</span>
                <i onClick={() => removeSelection(data.id)}>cancel</i>
            </div>
        )
    }

    return (
        <>
            <div id={`collection-${id}`} className="input-control-base collection-box" style={Vstyle}>
                {label && <label htmlFor={id} className="label">{label}</label>}
                <select
                    id={id}
                    name={name}
                    value={controlValues}
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
                        Object.values(controlOptions).map((option, i) => {
                            return controlValues.includes(option.value) && <ItemNode key={i} data={option} />
                        })
                    }
                    <input type="text" className="collection-adder" onClick={() => showDropDown()} onChange={(e) => showDropDown(e.target.value)} />
                </div>
            </div>
        </>
    )
}

export default Collection;