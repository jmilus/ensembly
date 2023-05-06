import 'server-only';

import { createClient } from '../../../utils/supabase-server';
import { loadUserPermissions } from '../../../pages/api/general/getUserPermissions';

import { fetchOneEnsemble } from '../../../pages/api/ensembles/getOneEnsemble';
import { fetchManyDivisions } from '../../../pages/api/ensembles/getManyDivisions';
import { fetchOneSchema } from '../../../pages/api/ensembles/getOneSchema';

import Ensemble from './Ensemble';

const EnsemblePage = async (context) => {
    console.log({ context });
    const { params } = context;
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    
    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    if (security.modules.ensembles) {
        const ensemble = await fetchOneEnsemble(context.params.id)
        const divisions = await fetchManyDivisions(ensemble.typeId)

        let schemaId = ensemble.schema[0].id;
        if (params.schema && params.schema != "x") schemaId = params.schema;
        const schema = await fetchOneSchema(schemaId)

        return <Ensemble initialProps={{ensemble, divisions, schema}}/>
        
    } else {
        throw new Error("You do not have permissions to view this information")
        // return <div>You do not have permissions to view this record</div>
    }
}

export default EnsemblePage;