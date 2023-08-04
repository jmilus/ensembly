import Link from 'next/link';
import ModalWrapper from '../../../../../../../components/ModalWrapper';
import { getAllEventTypes } from '../../../../../../api/calendar/event/types/route';

import { Form, Text, Select, DateTime } from '../../../../../../../components/Vcontrols';

export default async function AddEventModal(context) {
    const { model } = context.params;
    const types = await getAllEventTypes();
    return (
        <ModalWrapper title="Create Supporting Event">
            <Form id="new-supporting-event-form" METHOD="POST" APIURL="/api/calendar/event/model" auxData={{ parent: model }}>
                <section className="modal-fields">
                    <Text id="newModelName" name="modelName" label="Model Name" value="" limit="64" isRequired />
                </section>
                <section className="modal-fields">
                    <Select id="newEventType" name="type" label="Event Type" value="" options={types} isRequired />
                </section>
                <section className="modal-fields">
                    <DateTime id="newEventStart" name="modelStartDate" label="Event Start" value="" includeTime isRequired >
                        <DateTime id="newEventEnd" name="modelEndDate" label="Event End" value="" includeTime isRequired />
                    </DateTime>
                </section>
            </Form>
            <section className="modal-buttons">
                <Link href="./"><button>Cancel</button></Link>
                <button name="submit" form="new-supporting-event-form">Create Event</button>
            </section>
        </ModalWrapper>
    )
}