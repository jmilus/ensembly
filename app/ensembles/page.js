import 'server-only';

import { getManyEnsembles } from '../api/ensembles/route';
import { getAllEnsembleTypes } from '../api/ensembles/types/route';

import EnsembleCard from '../../components/EnsembleCard';
import { Form, Text, Select } from '../../components/Vcontrols';

import ModalButton from '../../components/ModalButton';
import FilterContainer from '../../components/FilterContainer';

const EnsemblesPage = async () => {
    const ensembleTypes = await getAllEnsembleTypes();

    const ensembles = await getManyEnsembles()

    return (
        <div className="page-base">
            <div className="action-section">
                <article style={{ padding: "10px" }}>
                    <h1>Ensembles</h1>
                    <article className="button-chain column">
                        <ModalButton
                            modalButton={<><i>add_circle</i><span>New Ensemble</span></>}
                            title="Create New Ensemble"
                            buttonClass="fat"
                        >
                            <Form id="create-new-ensemble-form" METHOD="POST" followPath="$slug$" >
                                <section className="modal-fields">
                                    <Text id="newEnsembleName" name="name" label="Ensemble Name" />
                                    <Select id="newEnsembleType" name="type" label="Ensemble Type" options={ ensembleTypes } />
                                </section>
                            </Form>
                            <section className="modal-buttons">
                                <button name="submit" form="create-new-ensemble-form">Create Ensemble</button>
                            </section>
                        </ModalButton>
                    </article>
                </article>
            </div>
            <div className="form-section">
                <div className="page-header">
                    {/* <h1>Ensembles</h1> */}
                </div>
                <div className="page-details">
                    <FilterContainer
                        id="ensembles-filter"
                        filterTag="ensemble"
                        columns={{ count: "auto-fill", width: "201px" }}
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
}

export default EnsemblesPage;