import { useContext } from 'react';

import { GlobalContext } from '../pages/_app';

const DropDownMenu = () => {
    const { dispatch, parameters } = useContext(GlobalContext);
    const { dropdown: { dim, options = [], value="", setSelectControlValue } = {} } = parameters;

    const hideDropDown = () => {
        dispatch({ route: "dropdown", payload: null })
    }
    
    const selectOption = (option) => {
        setSelectControlValue({ ...option, selected: true });
    }

    if (options) {
        return (
            <div id="dropdown-area">
                <div className="option-set" style={{left: dim.x, top: dim.y + dim.h, minWidth: dim.w}}>
                    {
                        Object.values(options).map((option, o) => {
                            let optionColor, myColor;
                            if (option.color) {
                                optionColor = JSON.parse(option.color);
                                myColor = `${optionColor.type}(${optionColor.values[0]},${optionColor.values[1]}%, ${optionColor.values[2]}%)`;
                            }
                            return <div key={o} className={`select-option ${option.selected ? "selected" : ""}`} onClick={() => selectOption(option)}>
                                {myColor && <div className="color-dot" style={{ backgroundColor: myColor }}></div>}
                                {option.name}
                            </div>
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