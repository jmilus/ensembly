import 'server-only'

import SubNav from 'components/SubNav'
import ModalButton from 'components/ModalButton';
import { Form, Text, Select } from 'components/Vcontrols';
import SecurityWrapper from 'components/SecurityWrapper';
import ItemCard from 'components/ItemCard';
import FilterContainer from 'components/FilterContainer';

import { getManyEnsembles } from '@/api/ensembles/route';
import { getAllEnsembleTypes } from '@/api/ensembles/types/route';

const EnsemblesLayout = async (props) => {
    const ensembles = await getManyEnsembles()
    const ensembleTypes = await getAllEnsembleTypes()
    const buttons = [
        <ModalButton
            key="x"
            modalButton={<><i>add_circle</i><span>New Ensemble</span></>}
            title="Create New Ensemble"
            buttonClass="fit"
        >
            <Form id="create-new-ensemble-form" METHOD="POST" followPath="$slug$" >
                <section className="modal-fields inputs">
                    <Text id="newEnsembleName" name="name" label="Ensemble Name" />
                    <Select id="newEnsembleType" name="type" label="Ensemble Type" options={ ensembleTypes } />
                </section>
            </Form>
            <section className="modal-buttons">
                <button name="submit" form="create-new-ensemble-form">Create Ensemble</button>
            </section>
        </ModalButton>
    ]

    return (
        <SecurityWrapper currentModule="ensembles">
            <div id="page-base">
                <div id="nav-header">
                    <SubNav root="ensembles" buttons={buttons} />
                </div>
                <div id="page-frame">
                    <div id="page">
                        <FilterContainer
                            id="ensembles-filter"
                            filterTag="ensemble"
                            columns={{ count: "auto-fill", width: "201px" }}
                            search={{ label: "Search Ensembles", searchProp: "caption" }}
                            filters={[
                                { name: "ensemble-type", filterBy: "subtitle", buttons: ensembleTypes.map(et => { return {caption: et.type} }) }
                            ]}
                        >
                            {
                                ensembles.map((ensemble, i) => {
                                    console.log({ensemble})
                                    return (
                                        <ItemCard
                                            key={i}
                                            caption={ensemble.name}
                                            subtitle={ensemble.ensemble_type.type}
                                            filterTag="ensemble"
                                            cardLinkTo={`/e/ensembles/${ensemble.id}/general`}
                                        />
                                    )
                                })
                            }
                        </FilterContainer>
                    </div>
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default EnsemblesLayout;