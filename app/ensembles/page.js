import 'server-only';

import { createClient } from '../../utils/supabase-server';
import { loadUserPermissions } from '../../pages/api/general/getUserPermissions';

import { fetchManyEnsembles } from '../../pages/api/ensembles/getManyEnsembles';

import Ensembles from './Ensembles';

const EnsemblesPage = async () => {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    if (security.modules.ensembles) {
        const ensembles = await fetchManyEnsembles()
        return <Ensembles ensembles={ensembles} />
        
    } else {
        throw "You do not have permission to view this information"
    }
}

export default EnsemblesPage;