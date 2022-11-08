import React, { useState, useEffect } from 'react';

import styles from '../styles/Tab.module.css';

export const Tab = (props) => {
    const { children } = props;
    return (
        <div className={styles.tabPage}>{children}</div>
    )
}

const TabControl = (props) => {
    const { children } = props;
    const [activeTabPage, setActiveTabPage] = useState();
    
    let activePage;
    const tabs = React.Children.map(children, child => {
        if (child.props.id === activeTabPage) activePage = React.cloneElement(child, children)
        return child.props.id;
    })
    if (!activeTabPage) setActiveTabPage(tabs[0]);

    return (
        <div className={styles.wrapper}>
            <ul className={styles.tabRow}>
                {
                    tabs.map(tab => {
                        return <li className={`tab-button ${activeTabPage === tab ? "active" : ""}`} onClick={() => setActiveTabPage(tab)}>{tab}</li>
                    })
                }
            </ul>
            {activePage}
        </div>
    )
}

export default TabControl;