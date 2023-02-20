import React, { useState, useEffect } from 'react';

export const Tab = ({ id, direction, hidePage, tabStyle, onLoad, children }) => {
    useEffect(() => {
        if(onLoad && !hidePage) onLoad(id)
    }, [hidePage])

    return (
        <div key={`page-${id}`} id={`page-${id}`} className={`tab-page ${direction ? direction : ""}`} style={{...tabStyle, display: hidePage && "none"}}>{children}</div>
    )
}

const TabControl = ({ type, onChange, children }) => {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (onChange) onChange(activeTab);
    }, [activeTab])

    let tabs = [];
    let pages = [];
    React.Children.forEach(children, (child, c) => {
        const newTab = <li key={`tab-${child.props.id}`} id={`tab-${child.props.id}`}className={`tab-button ${c === activeTab && "active"}`} onClick={() => setActiveTab(c)}>{child.props.id}</li>
        tabs.push(newTab)
        const newPage = React.cloneElement(child, { key: c, hidePage: c != activeTab }, child.props.children)
        pages.push(newPage)
    })

    return (
        <div className={`tab-wrapper ${type}`}>
            <ul className="tab-row">
                { tabs }
            </ul>
            { pages }
        </div>
    )
}

export default TabControl;