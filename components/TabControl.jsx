'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const Tab = ({ tabName, direction, hidePage, tabStyle, children }) => {
    const newTabStyle = hidePage ? { ...tabStyle, display: "none" } : { ...tabStyle }
    return (
        <div key={`page-${tabName}`} id={`page-${tabName}`} className={`tab-page ${direction ? direction : ""}`} style={newTabStyle}>{children}</div>
    )
}

const TabControl = ({ id, type="normal", onChange, startTab, style, children }) => {
    const [activeTab, setActiveTab] = useState(startTab || 0);
    const router = useRouter();

    const tabClick = (tabIndex, tabLoad, href) => {
        if (tabLoad) tabLoad();
        if (href) router.push(href);
        if (onChange) onChange(tabIndex);
        setActiveTab(tabIndex);
    }

    let tabs = [];
    let pages = [];
    React.Children.forEach(children, (child, c) => {
        const newTab = <div key={`${id}-tab-${c}`} id={`tab-${child.props.id}`} className={`tab-button ${c === activeTab ? "active" : ""}`} onClick={() => tabClick(c, child.props.onLoad, child.props.href)}>{child.props.tabName}</div>
        tabs.push(newTab)
        const newPage = React.cloneElement(child, { key: c, hidePage: c != activeTab }, child.props.children)
        pages.push(newPage)
    })

    switch (type) {
        case "accordion":
            return (
                <div className={`tab-wrapper ${type}`} style={style}>
                    {
                        pages.map((page, p) => {
                            return (
                                <div key={p} className={`accordion-tab${p === activeTab ? " active" : ""}`}>
                                    {tabs[p]}
                                    {page}
                                </div>
                            )
                        })
                    }
                </div>
            )
        case "vertical":
            return (
                <div className={`tab-wrapper ${type}`} style={style}>
                    <div className="tab-row">
                        { tabs }
                    </div>
                </div>
            )
        default:
            return (
                <div className={`tab-wrapper ${type}`} style={style}>
                    <div className="tab-row">
                        { tabs }
                    </div>
                    { pages }
                </div>
            )
    }

}

export default TabControl;