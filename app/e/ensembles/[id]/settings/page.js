import 'server-only';

import { getManyDivisions } from '@/api/ensembles/[id]/division/route';
import { Form, Text } from 'components/Vcontrols';
import { getOneEnsemble } from '@/api/ensembles/[id]/route';

export default async function EnsembleSettingsPage({ params }) {
    const ensemble = await getOneEnsemble(params.id)
    const divisions = await getManyDivisions(params.id)

    console.log({ params },{divisions})

    return (
        <div className="page-details">
            <article>
                <Form id="ensemble-settings-form" APIURL="" auto style={{flex: 0}}>
                    <Text id="ensemble-name" name="name" label="Ensemble Name" value={ensemble.name} isRequired />

                </Form>
                <fieldset style={{flex:1}}>
                    <legend>Divisions</legend>
                    {
                        divisions.map((division, d) => {
                            return <div key={d}>{division.name}</div>
                        })
                    }
                </fieldset>
            </article>
        </div>
    )
}