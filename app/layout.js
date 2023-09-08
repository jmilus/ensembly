import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import Nav from '../components/Nav';
import NavWrapper from '../components/NavWrapper';
import StatusBlip from '../components/StatusBlip';
import DropDownMenu from '../components/DropDownMenu';
import ContextFrame from '../components/ContextFrame';
import LoginBox from '../components/LoginBox';

import { getProfile } from '../app/api/auth/[id]/route';

import '../styles/globals.css'
import '../styles/layout.css';


export const revalidate = 0;

const RootLayout = async ({children}) => {
    const supabase = createServerComponentClient({ cookies });
    const {data: {session}, error} = await supabase.auth.getSession()
    // console.log("layout session:", session)

    const profile = await getProfile();

    const nav = <Nav />
    
    return (
        <html lang="en">
            <body>
                <ContextFrame profile={profile}>
                    {session ?
                        <div id="app-body">
                            <StatusBlip />
                            <DropDownMenu />
                            <NavWrapper mainNav={nav} />
                            {children}
                        </div>
                        :
                        <LoginBox />
                    }
                </ContextFrame>
            </body>
        </html>
    );
}
  
export default RootLayout;