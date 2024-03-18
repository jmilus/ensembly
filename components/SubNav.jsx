'use client'

import { useContext, useState, useRef } from 'react';
import { createClient } from 'utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';

import { GlobalContext } from '../components/ContextFrame';
import { getInitials } from '../utils';

import PopupMenu from './PopupMenu';

const SubNav = ({ caption, root, navNodes=[], buttons=[]}) => {
    const supabase = createClient();
    const [showMenu, setShowMenu] = useState(false);
    const userIconRef = useRef();
    const { parameters: { profile } } = useContext(GlobalContext)
    const router = useRouter();
    const path = usePathname();

    console.log({profile})

    let locations = [...navNodes]
    locations.sort(function(a, b) {
        return path.replace(a.route, "").length - path.replace(b.route, "").length
    })

    const initials = profile.Member ? getInitials(profile.Member?.aka) : <i style={{fontSize: "2em", margin: "auto"}}>no_accounts</i>;    

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        console.error(error)
        router.refresh()
    }

    const userMenuStyle = {
        padding: "10px 15px",
        justifyContent: "left"
    }
    const userIcon = <div ref={userIconRef} className="hero-icon" style={{['--hero-size']:"35px"}}>
        <button className="profile-button" onClick={() => setShowMenu(true)}>
            <div className="hero-initials">{initials}</div>
        </button>
        {showMenu && 
            <PopupMenu
                id={`subnav-popup`}
                parentRef={userIconRef}
                hideMe={() => setShowMenu(false)}
            >
                <article className="button-chain column" style={{['--hover-color']: "var(--color-c3)", marginTop: "10px"}}>
                    {profile.member &&
                        <button
                            className="select-option"
                            onClick={() => router.push(`/e/members/${profile.member}/account`)}
                            style={userMenuStyle}
                        >
                            <i>account_circle</i><span>My User Profile</span>
                        </button>}
                    <button className="select-option" onClick={() => signOut()} style={userMenuStyle}><i>logout</i><span>Sign Out</span></button>
                </article>
            </PopupMenu>
        }
    </div>

    const currentRoute = navNodes.find(nn => locations[0].caption === nn.caption)
    // console.log({navNodes},{currentRoute})
    const routeCaption = currentRoute?.caption.toLowerCase() || ""
        
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