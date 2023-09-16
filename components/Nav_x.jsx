import 'server-only';

import Link from 'next/link';

import { MENUOPTIONS } from '../config/index';

const Nav = async () => {

    return (
        <div className="menu-options fancy">
            {
                MENUOPTIONS.map((option, i) => {
                    if (option.spacer) return <div key={`spacer-${i}`} className="spacer"></div>
                    return (
                        <div key={i} className="menu-item">
                            <Link href={`/e/${option.route}`} className="icon-and-label" ><i>{option.icon}</i>{option.name}</Link>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Nav;