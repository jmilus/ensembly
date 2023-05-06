import 'server-only'

import NavEnvelope from './NavEnvelope';
import Link from 'next/link';
import { MENUOPTIONS } from '../config/index'

import { loadUserPermissions } from '../pages/api/general/getUserPermissions';

const Nav = async (props) => {
    console.log("Rendering Nav with", props.session.user.email);
    const authorization = await loadUserPermissions(props.session.user.email)
    const { permissions: { security } } = authorization;
    // console.log("loaded permissions:", security)

    return (
        <NavEnvelope user={"Anon User"}>
            <ul className="menu-options fancy">
                {
                    MENUOPTIONS.map((option, i) => {
                        if (option.spacer) return <li key={`spacer-${i}`} className="spacer"></li>
                        if (security.modules[option.name.toLowerCase()])
                            return (
                                <li key={i} className="menu-item">
                                    <Link href={`/${option.route}`} className="icon-and-label" ><i>{option.icon}</i>{option.name}</Link>
                                </li>
                            )
                        return null
                    })
                }
            </ul>
        </NavEnvelope>
    )
}

export default Nav;