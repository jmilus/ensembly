'use client'
import { useSupabase } from './supabase-provider';
import { useState } from 'react';
import { getInitials } from '../utils';

import Link from 'next/link';

const NavEnvelope = ({ children }) => {
    const {supabase, session} = useSupabase();
    const [expandMenu, setExpandMenu] = useState(false)
    const user = session?.user.user_metadata.full_name || "";

    const initials = getInitials(user || "");

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
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
                    <li key="a" className="menu-item"><Link href="/account" className="icon-and-label">Personal Settings<i>manage_accounts</i></Link></li>
                    <li key="b" className="menu-item" onClick={signOut}>Sign Out<i>logout</i></li>
                </ul>
                {children}
            </div>
        </div>
    )
}

export default NavEnvelope;