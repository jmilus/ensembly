import 'server-only';

import { createClient } from 'utils/supabase/server';
import { redirect } from 'next/navigation';

import Nav from 'components/Nav';
import NavWrapper from 'components/NavWrapper';
// import { ClientConsole } from 'components/ClientConsole';
import ContextFrame from 'components/ContextFrame';

import { getMemberUserProfile } from '@/api/auth/route';

// import 'styles/globals.css'
// import 'styles/layout.css';
// import 'components/Vcontrols/Vstyling.css';

export const revalidate = 0;

const ELayout = async ({children}) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        console.log("there was a session error:", error)
        redirect('/login');
    }

    const profile = await getMemberUserProfile();

    // console.log({ profile })

    const nav = <Nav />
    
    return (
        <ContextFrame profile={profile}>
            <div id="app-body">
                {/* <ClientConsole items={{ session: session, profile: profile }} /> */}
                <NavWrapper mainNav={nav} />
                { children }
            </div>
        </ContextFrame>
    );
}
  
export default ELayout;