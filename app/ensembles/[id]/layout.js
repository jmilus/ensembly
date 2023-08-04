import 'server-only';

import { getOneEnsemble } from '../../api/ensembles/[id]/route';
import { getOneLineup } from '../../api/ensembles/[id]/lineup/[lineup]/route';

import EnsembleNav from '../EnsemblesHelpers';

const EnsemblePage = async (context) => {
    // console.log({ context });

    const ensemble = await getOneEnsemble(context.params.id)

    return (
        <div className="page-base">
            <div className="action-section">
                <EnsembleNav ensemble={ensemble} />
            </div>
            <div className="form-section">
                {context.children}
            </div>
        </div>

    )
}

export default EnsemblePage;