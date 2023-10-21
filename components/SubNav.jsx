'use client'

import { useContext, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';

import { GlobalContext } from '../components/ContextFrame';
import { getInitials } from '../utils';

import PopupMenu from './PopupMenu';

const SubNav = ({ caption, root, navNodes=[], buttons=[]}) => {
    const supabase = createClientComponentClient();
    const [showMenu, setShowMenu] = useState(false);
    const userIconRef = useRef();
    const { parameters } = useContext(GlobalContext)
    const router = useRouter();
    const path = usePathname();

    const { profile } = parameters;

    let locations = [...navNodes]
    locations.sort(function(a, b) {
        return path.replace(a.route, "").length - path.replace(b.route, "").length
    })

    const initials = profile.member ? getInitials(profile.member?.aka) : <i style={{fontSize: "2em", margin: "auto"}}>no_accounts</i>;    

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        console.error(error)
        router.refresh()
    }

    const userIcon = <div ref={userIconRef} className="hero-icon">
        <button className="profile-button" onClick={() => setShowMenu(true)}>
            <div className="profile-icon">{initials}</div>
        </button>
        {showMenu && 
            <PopupMenu
                parentRef={userIconRef}
                hideMe={() => setShowMenu(false)}
            >
                <button className="fit select-option" onClick={() => signOut()}>Sign Out</button>
            </PopupMenu>
        }
    </div>

    const currentRoute = navNodes.find(nn => locations[0].caption === nn.caption)
    // console.log({navNodes},{currentRoute})
    const routeCaption = currentRoute?.caption.toLowerCase() || ""
    console.log({routeCaption})
        
    return (
        <div className="nav-wrapper">
            <div className="nav-header" >
                <span onClick={() => router.push(`/e/${root}`)}>{caption || root}</span>
            </div>
            {navNodes.length > 1 &&
                navNodes.map((node, n) => {
                    return <div key={n} className={`sub-nav-button ${locations[0].caption === node.caption ? "selected" : ""}`} onClick={() => router.push(node.route)}>{node.caption}</div>
                })
            }
            <div className="sub-nav-actions">
                {
                    Array.isArray(buttons)
                        ? 
                        buttons.map(button => button)
                        :
                        buttons[routeCaption] ? buttons[routeCaption].map(button => button) : null
                }
            </div>
            {userIcon}
        </div>
    )
}

export default SubNav;