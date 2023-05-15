'use client'

import React, { useState, useEffect } from 'react';

export const Tab = ({ id, direction, hidePage, tabStyle, onLoad, children }) => {
    useEffect(() => {
        if(onLoad && !hidePage) onLoad(id)
    }, [hidePage])

    const newTabStyle = hidePage ? { ...tabStyle, display: "none" } : { ...tabStyle }

    return (
        <div key={`page-${id}`} id={`page-${id}`} className={`tab-page ${direction ? direction : ""}`} style={newTabStyle}>{children}</div>
    )
}

const TabControl = ({ type="normal", onChange, children }) => {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (onChange) onChange(activeTab);
    }, [activeTab])

    let tabs = [];
    let pages = [];
    React.Children.forEach(children, (child, c) => {
        const newTab = <div key={`tab-${c}`} id={`tab-${child.props.id}`} className={`tab-button ${c === activeTab && "active"}`} onClick={() => setActiveTab(c)}>{child.props.id}</div>
        tabs.push(newTab)
        const newPage = React.cloneElement(child, { key: c, hidePage: c != activeTab }, child.props.children)
        pages.push(newPage)
    })

    switch (type) {
        case "accordion":
            return (
                <div className={`tab-wrapper ${type}`}>
                    <article>
                        {
                            pages.map((page, p) => {
                                return (
                                    <div key={p}>
                                        {tabs[p]}
                                        {page}
                                    </div>
                                )
                            })
                        }
                    </article>
                </div>
            )
        default:
            return (
                <div className={`tab-wrapper ${type}`} >
                    <ul className="tab-row">
                        { tabs }
                    </ul>
                    { pages }
                </div>
            )
    }

}

export default TabControl;