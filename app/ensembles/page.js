import 'server-only';

import { createClient } from '../../utils/supabase-server';
import { loadUserPermissions } from '../../pages/api/general/getUserPermissions';
import { fetchManyEnsembles } from '../../pages/api/ensembles/getManyEnsembles';

import EnsembleCard from '../../components/EnsembleCard';
import { Form, Text, Select } from '../../components/Vcontrols';

import Modal2 from '../../components/Modal2';
import { fetchManyEnsembleTypes } from '../../pages/api/ensembles/getManyEnsembleTypes';
import FilterContainer from '../../components/FilterContainer';

const EnsemblesPage = async () => {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    const ensembleTypes = await fetchManyEnsembleTypes();

    
    if (security.modules.ensembles) {
        const ensembles = await fetchManyEnsembles()
        console.log({ensembles})

        return (
            <div className="page-base">
                <div className="action-section">
                    <article style={{ padding: "20px" }}>
                        <Modal2
                            modalButton={<button><i>add_circle</i><span>New Ensemble</span></button>}
                            title="Create New Ensemble"
                        >
                            <Form id="create-new-ensemble-form" APIURL="/ensembles/createEnsemble" >
                                <section className="modal-fields">
                                    <Text id="newEnsembleName" field="name" label="Ensemble Name" />
                                    <Select id="newEnsembleType" field="typeId" label="Ensemble Type" options={ ensembleTypes } />
                                </section>
                                <section className="modal-buttons">
                                    <button name="submit">Create Ensemble</button>
                                </section>
                            </Form>
                        </Modal2>
                    </article>
                </div>
                <div className="form-section">
                    <div className="page-header">
                        <h1>Ensembles</h1>
                    </div>
                    <div className="page-details">
                        <FilterContainer
                            id="ensembles-filter"
                            filterTag="ensemble"
                            columns={{ count: "auto-fill", width: "200px" }}
                            search={{ label: "Search Ensembles", searchProp: "name" }}
                            filters={[
                                { name: "type", filterProp: "type", buttons: ensembleTypes.map(et => et.name)}
                            ]}
                        >
                            {
                                ensembles.map((ensemble, i) => {
                                    console.log({ensemble})
                                    return (
                                        <EnsembleCard
                                            key={i}
                                            ensemble={ensemble}
                                            presentation="grid"
                                            format="minimal"
                                            tag="ensemble"
                                            name={ensemble.name}
                                            type={ensemble.type.name}
                                        />
                                    )
                                })
                            }
                        </FilterContainer>
                    </div>
                </div>
            </div>
        )
        
    } else {
        throw "You do not have permission to view this information"
    }
}

export default EnsemblesPage;