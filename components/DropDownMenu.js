import { useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';

import { GlobalContext } from '../pages/_app';

const DropDownMenu = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { dropdown } = parameters;
    const [ddoptions, updateDdoptions] = useImmer()


    useEffect(() => {
        // console.log("rendering drop-down with:", { dropdown })
        if (dropdown) {
            updateDdoptions(dropdown.options)
        }
    })

    const hideDropDown = () => {
        dispatch({type: "dropdown", payload: null})
    }
    
    const selectOption = (option, o) => {
        updateDdoptions(draft => {
            console.log("draft:", draft[o]);
            draft[o].selected = !draft[o].selected;
        })
        dropdown?.action(option);
    }

    if (dropdown) {
        const { dim } = dropdown;
        return (
            <div id="dropdown-area">
                
                <div className="option-set" style={{left: dim.x, top: dim.y + dim.h, minWidth: dim.w}}>
                    {
                        ddoptions?.map((option, o) => {
                            return <div key={o} className={`select-option ${option.selected ? "selected" : ""}`} onClick={() => selectOption(option, o)} >{option.name}</div>
                        })
                    }
                </div>
                <div id="dropdown-backing" onClick={hideDropDown}></div>
            </div>
        )
    }
    return null;
}

export default DropDownMenu;