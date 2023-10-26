import 'server-only';

import { getManyDivisions } from '@/api/ensembles/[id]/division/route';
import { Form, Select, Text } from 'components/Vcontrols';
import { getOneEnsemble } from '@/api/ensembles/[id]/route';

import ItemCard from 'components/ItemCard';
import Collapser from 'components/Collapser';
import ModalButton from 'components/ModalButton';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

export default async function EnsembleSettingsPage({ params }) {
    const ensemble = await getOneEnsemble(params.id)
    const divisions = await getManyDivisions(params.id, true)
    const capacities = await getAllMembershipCapacities()

    // console.log({ params }, { divisions })
    console.log({capacities})
    
    const generateNestedDivs = (divisions) => {
        console.log({ divisions })
        return Object.values(divisions).map((division, d) => {

            const createDivModal = <ModalButton
                modalButton={<i>library_add</i>}
                title={`Create Sub-Division of ${division.name}`}
            >
                <Form id="create-subdivision-form" APIURL={`/api/ensembles/${ensemble.id}/division/create-division`} METHOD="POST" auxData={{ parent_division: division.id, capacity: division.capacity }}>
                    <section className="inputs">
                        <Text id="division-name" name="name" label="Division Name" isRequired />
                        <Text id="division-taxonomy" name="taxonomy" label="Taxonomy" />
                    </section>
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="create-subdivision-form">Create</button>
                </section>
            </ModalButton>

            const updateDivModal = <ModalButton
                modalButton={<i>edit</i>}
                title={`Update ${division.name} Sub-Division`}
            >
                <Form id="update-subdivision-form" APIURL={`/api/ensembles/${ensemble.id}/division/${division.id}`} METHOD="PUT">
                    <section className="inputs">
                        <Text id="division-name" name="name" label="Division Name" value={division.name} isRequired />
                        <Text id="division-taxonomy" name="taxonomy" label="Taxonomy" value={division.taxonomy} />
                        {!division.parent_division &&
                            <Select id="division-capacity" name="capacity" label="Capacity" value={division.capacity} options={capacities} isRequired />
                        }
                    </section>
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="update-subdivision-form">Save</button>
                </section>
            </ModalButton>

            const deleteDivButton = <Form id="delete-div-form" APIURL={`/api/ensembles/${ensemble.id}/division/${division.id}`} METHOD="DELETE" style={{flex: 0}} >
                <button name="submit"><i>delete</i></button>
            </Form>

            const deleteDivModal = <ModalButton
                modalButton={<i>delete</i>}
                title={`Delete ${division.name}`}
            >
                <Form id="delete-div-form" APIURL={`/api/ensembles/${ensemble.id}/division/${division.id}`} METHOD="DELETE" style={{flex: 0}} >
                    {`Delete ${division.name} Division? This will also delete all sub divisions.`}
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="delete-div-form" className="angry"><i>delete</i><span>Delete</span></button>
                </section>
            </ModalButton>

            const collapserButton = <div style={{flex: 1, display: "flex", margin: "auto 10px"}}>
                <span className="expander" style={{ flex: 1 }}>
                    {division.name}
                    <span style={{ fontStyle: "italic", color: "var(--mint6)", marginLeft: "10px" }}>{capacities.find(cap => cap.id === division.capacity).type} | {division.taxonomy}</span>
                </span>
                <section className="inputs">
                    {createDivModal}
                    {updateDivModal}
                    {deleteDivModal}
                </section>
            </div>

            if (division.children) {
                return (
                    <Collapser
                        key={d}
                        id={division.id}
                        button={collapserButton}
                        nodeHeight="40px"
                        startCollapsed={false}
                    >
                        { generateNestedDivs(division.children) }
                    </Collapser>
                )
            }
                
            return <div key={d} className="collapser-node terminus" style={{['--node-height']: "40px"}}>{collapserButton}</div>
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
        <div id="page" style={{ marginTop: "40px" }}>
            <fieldset style={{flex: 1}}>
                <legend>
                </legend>
                <Form id="ensemble-settings-form" APIURL={`/api/ensembles/${ensemble.id}`} auto style={{flex: 0}}>
                    <Text id="ensemble-name" name="name" label="Ensemble Name" value={ensemble.name} isRequired />

                </Form>
            </fieldset>
            <fieldset style={{flex:1, display: "flex", flexDirection: "column", height: "100%"}}>
                <legend>Divisions</legend>
                <section className="button-tray">
                    <ModalButton
                        modalButton={<><i>library_add</i><span>Create New Division</span></>}
                        buttonClass="fit"
                        title="Create Root-Level Division"
                    >
                        <Form id="create-root-division-form" APIURL={`/api/ensembles/${ensemble.id}/division/create-division`} METHOD="POST">
                            <section className="inputs">
                                <Text id="division-name" name="name" label="Division Name" isRequired />
                                <Text id="division-taxonomy" name="taxonomy" label="Taxonomy" />
                                <Select id="division-capacity" name="capacity" label="Capacity" options={capacities} isRequired />
                            </section>
                        </Form>
                        <section className="modal-buttons">
                            <button name="submit" className="fit" form="create-root-division-form">Create</button>
                        </section>
                    </ModalButton>
                </section>
                <article className="scroll">
                    {
                        generateNestedDivs(divisions)
                    }
                </article>
            </fieldset>
        </div>
    )
}