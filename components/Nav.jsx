'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { getInitials } from '../utils';

const Nav = ({ user, options }) => {
    const [expandMenu, setExpandMenu] = useState(false)
    const router = useRouter();

    const supabase = createClientComponentClient();
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        console.error(error)
        router.refresh()
    }

    const initials = user ? getInitials(user?.aka) : "XXX";

    return (
        <div id="nav-base">
            <div className={`main-menu-panel ${expandMenu ? "expanded" : ""}`} onMouseLeave={() => setExpandMenu(false)}>
                <div className="menu-header" onClick={() => setExpandMenu(!expandMenu)}>
                    <div className="app-logo fancy">E<span className="app-full-title">nsembly</span></div>
                    <div className="profile-button">
                        <div className="profile-icon">{initials}</div>
                    </div>
                </div>
                <div className={`user-menu`}>
                    <div key="a" className="menu-item"><Link href="/account" className="icon-and-label">Personal Settings<i>manage_accounts</i></Link></div>
                    <div key="b" className="menu-item" onClick={signOut}>Sign Out<i>logout</i></div>
                </div>
                <div className="menu-options fancy">
                    {
                        options.map((option, i) => {
                            if (option.spacer) return <div key={`spacer-${i}`} className="spacer"></div>
                            return (
                                <div key={i} className="menu-item">
                                    <Link href={`/${option.route}`} className="icon-and-label" ><i>{option.icon}</i>{option.name}</Link>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
        
    )
}

export default Nav;