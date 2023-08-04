import Link from 'next/link';
import ModalWrapper from '../../../../components/ModalWrapper';

import { Form, Text } from '../../../../components/Vcontrols';

export default async function AddEventModal() {

    return (
        <ModalWrapper title="Create New Member">
            <Form id="new-member-modal-form" METHOD="POST" followPath="$slug$" >
                <section className="modal-fields">
                    <Text id="newMemberFirstName" name="firstName" label="First Name" value="" isRequired />
                    <Text id="newMemberLastName" name="lastName" label="Last Name" value="" isRequired />
                </section>
            </Form>
            <section className="modal-buttons">
                <Link href="./"><button>Cancel</button></Link>
                <button name="submit" form="new-member-modal-form">Create Member</button>
            </section>
        </ModalWrapper>
    )
}