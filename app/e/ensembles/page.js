import 'server-only'

import SubNav from 'components/SubNav'
import ModalButton from 'components/ModalButton';
import { Form, Text, Select } from 'components/Vcontrols';
import SecurityWrapper from 'components/SecurityWrapper';
import ItemCard from 'components/ItemCard';
import FilterContainer from 'components/FilterContainer';

import { getManyEnsembles } from '@/api/ensembles/route';
import { getAllEnsembleTypes } from '@/api/ensembles/types/route';

const EnsemblesPage = async (props) => {
    const ensembles = await getManyEnsembles()
    const ensembleTypes = await getAllEnsembleTypes()

    const newEnsembleButton = (button, buttonStuff) => {
        return (
            <ModalButton
                key="x"
                renderButton={button}
                title="Create New Ensemble"
                buttonClass={buttonStuff.class}
                buttonStyle={buttonStuff.style}
            >
                <Form id="create-new-ensemble-form" METHOD="POST" followPath="/e/ensembles/$slug$" >
                    <section className="modal-fields inputs">
                        <Text id="newEnsembleName" name="name" label="Ensemble Name" />
                        <Select id="newEnsembleType" name="type" label="Ensemble Type" options={ensembleTypes} />
                    </section>
                </Form>
                <section className="modal-buttons">
                    <button name="submit" className="fit" form="create-new-ensemble-form">Create Ensemble</button>
                </section>
            </ModalButton>
        )
    }

    

    const newEnsembleNavButton = newEnsembleButton(<><i>add_circle</i><span>New Ensemble</span></>, {class: "fit"})
    const newEnsembleGridButton = newEnsembleButton(<ItemCard
        caption="Create New Ensemble"
        itemIcon={<i>add_box</i>}
        style={{color: "hsl(var(--color-h2))", borderStyle: "dashed", borderColor: "hsl(var(--color-h2))", height: "100%"}}
    />,
        { style: { border: "none", height: "100%", background: "transparent" } }
    )

    const buttons = [
        newEnsembleNavButton
    ]

    return (
        <SecurityWrapper currentModule="ensembles">
            <div id="page-base">
                <div id="page-header">
                    <SubNav root="ensembles" buttons={buttons} />
                </div>
                <div id="page-frame">
                    <div id="page">
                        <FilterContainer
                            id="ensembles-filter"
                            filterTag="ensemble"
                            search={{ label: "Search Ensembles", searchProp: "caption" }}
                            filters={[
                                { name: "ensemble-type", filterBy: "subtitle", buttons: ensembleTypes.map(et => { return {caption: et.type} }) }
                            ]}
                        >
                            <article className="scroll grid" style={{['--min-width']: "201px"}}>
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
                                {
                                    newEnsembleGridButton
                                }
                            </article>
                        </FilterContainer>
                    </div>
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default EnsemblesPage;