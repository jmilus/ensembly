import 'server-only';

import { getManyDivisions } from '@/api/ensembles/[id]/division/route';
import { Form, Text } from 'components/Vcontrols';
import { getOneEnsemble } from '@/api/ensembles/[id]/route';

import ItemCard from 'components/ItemCard';
import Collapser from 'components/Collapser';
import ModalButton from 'components/ModalButton';

export default async function EnsembleSettingsPage({ params }) {
    const ensemble = await getOneEnsemble(params.id)
    const divisions = await getManyDivisions(params.id, true)

    // console.log({ params }, { divisions })
    
    const generateNestedDivs = (divisions) => {
        console.log({ divisions })
        return Object.values(divisions).map((division, d) => {
            const divModal = <ModalButton
                modalButton={<i>library_add</i>}
                buttonClass="fit"
                title={`Create Sub-Division of ${division.name}`}
            >
                <Form id="upload-members-form" APIURL={`/api/ensembles/${ensemble.id}/division/create-division`} METHOD="POST" auxData={{ parent_division: division.id, capacity: division.capacity }}>
                    <section className="inputs">
                        <Text id="division-name" name="name" label="Division Name" isRequired />
                        <Text id="division-taxonomy" name="taxonomy" label="Taxonomy" />
                    </section>
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="upload-members-form">Create</button>
                </section>
            </ModalButton>

            if (division.children) {
                return (
                    <Collapser
                        key={d}
                        id={division.id}
                        button={divModal}
                        caption={<span>{division.name}</span>}
                        nodeHeight="40px"
                        startCollapsed={false}
                    >
                        { generateNestedDivs(division.children) }
                    </Collapser>
                )
            }
                return <div className="collapser-node terminus">{division.name}</div>
            // return (
            //     <ItemCard
            //         key={d}
            //         classes="basic dark"
            //         caption={division.name}
            //     >
            //     </ItemCard>
                    
                
            // )

        })
    }

    return (
        <div className="page-details" style={{ marginTop: "40px" }}>
            <fieldset style={{flex: 1}}>
                <legend>
                </legend>
                <Form id="ensemble-settings-form" APIURL="" auto style={{flex: 0}}>
                    <Text id="ensemble-name" name="name" label="Ensemble Name" value={ensemble.name} isRequired />

                </Form>
            </fieldset>
            <fieldset style={{flex:1}}>
                <legend>Divisions</legend>
                {
                    generateNestedDivs(divisions)
                }
            </fieldset>
        </div>
    )
}