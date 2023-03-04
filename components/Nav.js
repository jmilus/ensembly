import { useState, useContext } from 'react';
import { useRouter } from 'next/router';

import { supabase } from '../lib/supabase-client';

import { MENUOPTIONS } from '../config';
import { getInitials } from '../utils';
import { GlobalContext } from '../pages/_app';

import { useUser } from '@supabase/auth-helpers-react';


const Nav = () => {
    const { parameters, dispatch } = useContext(GlobalContext);
    const [expandMenu, setExpandMenu] = useState(false)
    const user = useUser();
    console.log({ user }, { parameters })
    const { permissions } = parameters;
    const initials = getInitials(user.user_metadata.full_name || "");

    const router = useRouter();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
    }

    const goToModule = (module) => {
        router.push(module)
    }

    return (
        <div id="nav-base">
            <div className={`main-menu-panel ${expandMenu ? "expanded" : ""}`} onMouseLeave={() => setExpandMenu(false)}>
                <div className="menu-header" onClick={() => setExpandMenu(!expandMenu)}>
                    <div className="app-logo fancy">E<span className="app-full-title">nsembly</span></div>
                    <div className="profile-button">
                        <div className="profile-icon">{initials}</div>
                    </div>
                </div>
                <ul className={`user-menu`}>
                    <li className="menu-item" onClick={() => router.push("/account")}>Personal Settings<i>manage_accounts</i></li>
                    <li className="menu-item" onClick={signOut}>Sign Out<i>logout</i></li>
                </ul>
                <ul className="menu-options fancy">
                    {permissions &&
                        MENUOPTIONS.map((option, i) => {
                            if (option.spacer) return <li className="spacer"></li>
                            if (permissions[option.route]?.module === 'false') return null;
                            return (
                                <li key={i} className="menu-item" onClick={() => goToModule(`/${option.route}`)}>
                                    <button className="icon-and-label" ><i>{option.icon}</i>{option.name}</button>
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