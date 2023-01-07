import { useState } from 'react';

import Link from 'next/link';
import _ from 'lodash';
import cx from 'classnames';
import x from '../styles/Nav.module.css';

// import '../styles/Nav.css';





const Nav = ({ menuOptions }) => {
    const [expanded, setExpanded] = useState(false)
    const [expandNow, setExpandNow] = useState(false)

    const collapseNav = () => {
        setExpanded(false);
        setExpandNow(false);
    }

    return (
        <div id="nav-base">
            <div className={`main-menu-panel slide-out ${expandNow ? "now" : ""}`} onMouseLeave={() => collapseNav()} onClick={() => setExpandNow(true)}>
                <div className={x.menuHeader}>
                    <div className={ cx( x.appLogo, "fancy") }>E<span className="app-full-title slide-out">nsembly</span></div>
                    <div className={x.profileBtn} onClick={() => setExpanded(!expanded)}>
                        <div className={x.profileIcon}>JM</div>
                    </div>
                </div>
                <ul className={`user-menu${expanded ? " show" : ""}`}>
                    <li className={x.menuItem}>Personal Settings</li>
                    <li className={x.menuItem} onClick={() => console.log("signing out!")}>Sign Out</li>
                </ul>
                <ul className={cx(x.menuOptions, "fancy")}>
                    {
                        menuOptions.map((option, i) => {
                            return (
                                <li key={i} className={x.menuItem}>
                                    <Link href={`/${option.route}`}><button className="icon-and-label"><i>{option.icon}</i>{option.name}</button></Link>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </div>
    )
}

export default Nav;