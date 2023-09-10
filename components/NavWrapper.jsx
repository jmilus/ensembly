'use client'

import { useState } from 'react';

const NavWrapper = ({ mainNav }) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <div id="nav-base">
            <div className={`main-menu-panel ${expanded ? "expanded" : ""}`} onMouseLeave={() => setExpanded(false)}>
                <div className="menu-header" onClick={() => setExpanded(!expanded)}>
                    <div className="app-logo">E<span className="app-full-title">nsembly</span></div>
                </div>
                {mainNav}
            </div>
        </div>
    )
}

export default NavWrapper;