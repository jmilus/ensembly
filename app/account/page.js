import 'server-only';

import { createClient } from '../../utils/supabase-server';
// import V from '../../components/Vcontrols/VerdantControl';
import Account from './Account';

const AccountPage = async () => {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    const { user } = session;

    return <Account {...{user}} />
}

export default AccountPage;