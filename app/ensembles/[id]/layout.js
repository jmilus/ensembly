import 'server-only';

import { createClient } from '../../../utils/supabase-server';
import { loadUserPermissions } from '../../../pages/api/general/getUserPermissions';

import { fetchOneEnsemble } from '../../../pages/api/ensembles/getOneEnsemble';
import { fetchManyDivisions } from '../../../pages/api/ensembles/getManyDivisions';
import { fetchOneSchema } from '../../../pages/api/ensembles/getOneSchema';

import EnsembleNav from '../EnsemblesHelpers';

import basePageStyles from '../../../styles/basePage.module.css';


const EnsemblePage = async (context) => {
    console.log({ context });
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    
    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    if (security.modules.ensembles) {
        const ensemble = await fetchOneEnsemble(context.params.id)
        const schema = await fetchOneSchema(ensemble.schema[0].id)

        return (
            <div className={basePageStyles.pageBase}>
                <div className={basePageStyles.actionSection}>
                    <EnsembleNav ensemble={ensemble} schema={schema} />
                </div>
                <div className={basePageStyles.formSection}>
                    <div className={basePageStyles.pageDetails}>
                        {context.children}
                    </div>
                </div>
            </div>

        )
        
    } else {
        throw new Error("You do not have permissions to view this information")
        // return <div>You do not have permissions to view this record</div>
    }
}

export default EnsemblePage;