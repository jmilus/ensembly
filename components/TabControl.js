import React, { useState } from 'react';

export const Tab = (props) => {
    const { children } = props;
    return (
        <div className={`tab-page ${props.direction}`}>{children}</div>
    )
}

const TabControl = (props) => {
    const { type, children } = props;
    const [activeTabPage, setActiveTabPage] = useState();
    
    let activePage;
    const tabs = React.Children.map(children, child => {
        if (child.props.id === activeTabPage) {
            activePage = React.cloneElement(child, children)
            if (child.props.onTabLoad) child.props.onTabLoad()
            if (props.onAnyTabLoad) props.onAnyTabLoad();
        }
        return child.props.id;
    })
    if (!activeTabPage) setActiveTabPage(tabs[0]);

    return (
        <div className={`tab-wrapper ${type}`}>
            <ul className="tab-row">
                {
                    tabs.map((tab, t) => {
                        return <li key={t} className={`tab-button ${activeTabPage === tab ? "active" : ""}`} onClick={() => setActiveTabPage(tab)}>{tab}</li>
                    })
                }
            </ul>
            {activePage}
        </div>
    )
}

export default TabControl;