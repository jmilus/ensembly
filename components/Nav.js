import Link from 'next/link';
import _ from 'lodash';
import cx from 'classnames';
import x from '../styles/Nav.module.css';
// import '../styles/Nav.css';

const Nav = ({ menuOptions }) => {
    return (
        <div className={ cx(x.mainMenuPanel, x.slideOut) }>
            <div className={x.menuHeader}>
                <div className={ cx( x.appLogo, "fancy") }>E<span className={ cx( x.appFullTitle, x.slideOut) }>nsembly</span></div>
                <div className={x.profileBtn}>
                    <div className={x.profileIcon}>JM</div>
                </div>
            </div>
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
    )
}

export default Nav;