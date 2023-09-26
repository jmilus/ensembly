import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Nav from 'components/Nav';
import NavWrapper from 'components/NavWrapper';
import StatusBlip from 'components/StatusBlip';
import { ClientConsole } from 'components/ClientConsole';
import ContextFrame from 'components/ContextFrame';

import { getProfile } from '@/api/auth/[id]/route';

// import 'styles/globals.css'
// import 'styles/layout.css';
// import 'components/Vcontrols/Vstyling.css';

export const revalidate = 0;

const ELayout = async ({children}) => {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession()
    if(error) console.log("there was a session error:", error)
    // console.log("E layout runs with session:", session)
    if (!session) redirect('/login');

    const profile = await getProfile();

    const nav = <Nav />
    
    return (
        <ContextFrame profile={profile}>
            <div id="app-body">
                <StatusBlip />
                <ClientConsole items={{ session: session, profile: profile }} />
                <NavWrapper mainNav={nav} />
                { children }
            </div>
        </ContextFrame>
    );
}
  
export default ELayout;