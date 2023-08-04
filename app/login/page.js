import 'server-only';

import { redirect } from 'next/navigation';
// import { supabase } from '../../lib/supabase-server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'

import LoginBox from '../../components/LoginBox';

const Login = async () => {
    const supabase = createServerComponentClient({ cookies });
    const {data: {session}, error} = await supabase.auth.getSession()
    console.log("****** session:", session);
    if (error) console.log("login session error:", error);
    if (session) redirect('/');

    return <LoginBox />;
}

export default Login;