import Link from 'next/link';

import { getManyEnsembles } from '../../../../api/ensembles/route';

import ModalWrapper from '../../../../../components/ModalWrapper'

import { Form, Select } from '../../../../../components/Vcontrols';

export default async function AddEventModal({ params }) {
    const ensembleList = await getManyEnsembles();

    return (
        <ModalWrapper title="New Membership">
            <Form id="add-membership-form" METHOD="POST" APIURL={`/api/membership`} auxData={{ member: params.id }} >
                <section className="modal-fields">
                    <Select id="ensembleName" name="ensemble" label="Ensemble" options={ensembleList} />
                </section>
            </Form>
            <section className="modal-buttons">
                <Link href="./"><button>Cancel</button></Link>
                <button name="submit" form="add-membership-form">Submit</button>
            </section>
        </ModalWrapper>
    )
}