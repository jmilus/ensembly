import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import LoginBox from 'components/LoginBox';


const Login = async () => {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession()

    if (session) redirect(`/e/dashboard`);
    return <LoginBox />;
}

export default Login;