import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';

import Nav from '../components/Nav';
import StatusBlip from '../components/StatusBlip';
import Modal from '../components/Modal';
import DropDownMenu from '../components/DropDownMenu';
import ContextFrame from '../components/ContextFrame';
import LoginBox from '../components/LoginBox';

import { getProfile } from '../app/api/auth/[id]/route';

import { MENUOPTIONS } from '../config/index'

import '../styles/globals.css'
import '../styles/layout.css';


export const revalidate = 0;

const RootLayout = async ({children}) => {
    const supabase = createServerComponentClient({ cookies });
    const {data: {session}, error} = await supabase.auth.getSession()
    // console.log("layout session:", session)

    const { member, permissions } = await getProfile();
    // console.log({ member }, { permissions });

    const navOptions = MENUOPTIONS.filter((option) => {
        // console.log("option:", option)
        return permissions?.modules[option.name?.toLowerCase()]
    })
    
    return (
        <html lang="en">
            <body>
                <ContextFrame>
                    {session ?
                        <div id="app-body">
                            <StatusBlip />
                            <DropDownMenu />
                            <Modal />
                            <Nav user={member} options={navOptions} />
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