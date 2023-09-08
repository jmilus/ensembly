'use client'

import { useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';

import { GlobalContext } from '../components/ContextFrame';
import { getInitials } from '../utils';

import Link from 'next/link';

const MessagesNav = ({caption, root, navNodes=[], buttons=[]}) => {
    const supabase = createClientComponentClient();
    const { parameters } = useContext(GlobalContext)
    const router = useRouter();
    const path = usePathname();

    const { profile } = parameters;

    console.log({ profile })

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
        return foundSegment;
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        console.error(error)
        router.refresh()
    }

    let pathSegments = path.split("/")
    // console.log({ pathSegments })
    let routeCaption = navNodes.length > 0 ? findSegment(pathSegments) : root;

    let navButtons = buttons.map(button => button)

    const navNodeButtons = navNodes.map((node, n) => {
        const route = node.route.startsWith("/") ? `/${root}/${node.route}` : `./${node.route}`
        return <div key={n} className={`sub-nav-button ${routeCaption.toLowerCase() === node.caption.toLowerCase() ? "active" : ""}`} onClick={() => router.push(route)}>{node.caption}</div>
    })

    const userMenu = <div className={`user-menu`}>
        <div key="a" className="menu-item"><Link href="/account" className="icon-and-label">Personal Settings<i>manage_accounts</i></Link></div>
        <div key="b" className="menu-item" onClick={signOut}>Sign Out<i>logout</i></div>
    </div>

    const userIcon = <div className="hero-icon profile-button">
        <div className="profile-icon">{initials}</div>
    </div>
    
    return (
        <>
            <div className="nav-header" >
                <span onClick={() => router.push(`/${root}`)}>{caption || routeCaption}</span>
            </div>
            {
                navNodeButtons
            }
            <div className="sub-nav-actions">
                {
                    navButtons
                }
            </div>
            {userIcon}
        </>
    )
}

export default MessagesNav;