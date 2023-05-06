import 'server-only';

import { createClient } from '../../../../../utils/supabase-server';
import { loadUserPermissions } from '../../../../../pages/api/general/getUserPermissions';

import { fetchOneEnsemble } from '../../../../../pages/api/ensembles/getOneEnsemble';
import { fetchManyDivisions } from '../../../../../pages/api/ensembles/getManyDivisions';
import { fetchOneSchema } from '../../../../../pages/api/ensembles/getOneSchema';

import ViewSchema from './ViewSchema';

const ViewSchemaPage = async ({ params }) => {
    console.log("view Schema params:", {params})
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    

    if (security.modules.ensembles) {
        const ensemble = await fetchOneEnsemble(params.id)
        const divisions = await fetchManyDivisions(ensemble.typeId)

        const schemaId = params.schema === "x" ? ensemble.schema[0].id : params.schema;
        const schema = await fetchOneSchema(schemaId)

        return <ViewSchema initialProps={{ensemble, divisions, schema}} />
        
    } else {
        throw "You do not have permission to view this information"
    }
}

export default ViewSchemaPage;