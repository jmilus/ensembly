import { useState, useEffect } from 'react';

const SubMenu = ({options, style}) => {
    const [expanded, setExpanded] = useState(false)

    const handleClick = (action) => {
        setExpanded(false);
        action();
    }

    const handleMouseOut = (event) => {
        const selectObject = document.getElementById('active-dropdown');
        if (event.relatedTarget && event.relatedTarget.className) {
            if (selectObject.compareDocumentPosition(event.relatedTarget) === 20) {
                return null;
            }
        }
        setExpanded(false);
    }

    return (
        <object className="submenu" style={style}>
            <i className={`btn ${expanded && "active"}`} onClick={() => setExpanded(!expanded)}>more_vert</i>
            {expanded &&
                <div id="active-dropdown" className="drop-down" onMouseLeave={(e) => handleMouseOut(e)}>
                    {
                        options.map((option, i) => {
                            return <div key={i} className="menu-option" onClick={() => handleClick(option.action)} style={option.style}>{option.caption}</div>
                        })
                    }
                </div>
            }
        </object>
    )
}

export default SubMenu;