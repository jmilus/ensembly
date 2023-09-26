'use client'

import { useContext, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';

import { GlobalContext } from '../components/ContextFrame';
import { getInitials } from '../utils';

import Link from 'next/link';
import PopupMenu from './PopupMenu';

const MessagesNav = ({caption, root, navNodes=[], buttons=[]}) => {
    const supabase = createClientComponentClient();
    const [showMenu, setShowMenu] = useState(false);
    const userIconRef = useRef();
    const { parameters } = useContext(GlobalContext)
    const router = useRouter();
    const path = usePathname();

    const { profile } = parameters;

    // console.log({ profile }, showMenu)

    // const user = supabase.session;

    const initials = profile.member ? getInitials(profile.member?.aka) : <i style={{fontSize: "2em", margin: "auto"}}>no_accounts</i>;
    
    // console.log({ navNodes })
    
    const findSegment = (segments) => {
        segments.reverse();
        const nodeCaptions = Object.values(navNodes).map(nn => nn.caption.toLowerCase())
        // console.log({segments}, {nodeCaptions})
        const foundSegment = segments.find(segment => {
            return nodeCaptions.includes(segment.toLowerCase())
        })
        // console.log({ foundSegment });
        return foundSegment ? foundSegment : segments[1];
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        console.error(error)
        router.refresh()
    }

    let pathSegments = path.split("/")
    // console.log({ pathSegments })
    let routeCaption = navNodes.length > 0 ? findSegment(pathSegments) : root;

    const navigate = (route) => {
        console.log("navigating to:", route);
        router.push(route);
    }

    const navNodeButtons = navNodes.map((node, n) => {
        const route = node.route.startsWith("/") ? `/e/${root}${node.route}` : `./${node.route}`
        return <div key={n} className={`sub-nav-button ${routeCaption.toLowerCase() === node.caption.toLowerCase() ? "selected" : ""}`} onClick={() => navigate(route)}>{node.caption}</div>
    })

    const userMenu = <div className={`user-menu`}>
        <div key="a" className="menu-item"><Link href="/account" className="icon-and-label">Personal Settings<i>manage_accounts</i></Link></div>
        <div key="b" className="menu-item" onClick={signOut}>Sign Out<i>logout</i></div>
    </div>

    const userIcon = <div ref={userIconRef} className="hero-icon">
        <button className="profile-button" onClick={() => setShowMenu(true)}>
            <div className="profile-icon">{initials}</div>
        </button>
        {showMenu && 
            <PopupMenu
                parentRef={userIconRef}
                hideMe={() => setShowMenu(false)}
            >
                <button className="select-option" onClick={() => signOut()}>Sign Out</button>
            </PopupMenu>
        }
    </div>
    
    return (
        <div className="nav-wrapper">
            <div className="nav-header" >
                <span onClick={() => router.push(`/e/${root}`)}>{caption || routeCaption}</span>
            </div>
            {
                navNodeButtons
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

export default MessagesNav;