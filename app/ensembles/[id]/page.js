import 'server-only';

import { createClient } from '../../../utils/supabase-server';
import { loadUserPermissions } from '../../../pages/api/general/getUserPermissions';
import { fetchOneEnsemble } from '../../../pages/api/ensembles/getOneEnsemble';

import { Form, Text } from '../../../components/Vcontrols';

const EnsemblePage = async (context) => {

    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    
    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    if (security.modules.ensembles) {
        const ensemble = await fetchOneEnsemble(context.params.id)

        return (
            <>
                <div className="page-header">
                    <Form id="ensembleName" APIURL="/ensembles/updateThisEnsemble" recordId={ensemble.id}>
                        <Text id="name" field="name" value={ensemble.name} hero isRequired />
                    </Form>
                </div>
                <div className="page-details">
                    
                </div>
            </>
        )
        
    } else {
        throw new Error("You do not have permissions to view this information")
        // return <div>You do not have permissions to view this record</div>
    }
}

export default EnsemblePage;