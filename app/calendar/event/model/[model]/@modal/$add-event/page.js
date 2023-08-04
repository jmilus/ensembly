import Link from 'next/link';
import ModalWrapper from '../../../../../../../components/ModalWrapper';
import { getOneEventModel } from '../../../../../../api/calendar/event/model/[model]/route';
import { getAllEventTypes } from '../../../../../../api/calendar/event/types/route';

import { Form, Text, Select, DateTime } from '../../../../../../../components/Vcontrols';

export default async function AddEventModal(context) {
    const { model } = context.params;
    const eventModel = await getOneEventModel(model);
    const types = await getAllEventTypes();
    return (
        <ModalWrapper title="Add Event to Model">
            <Form id="new-event-modal-form" APIURL={`/api/calendar/event/model/${model}`} METHOD="POST" auxData={{exception: true}} >
                <section className="modal-fields">
                    <Text id="newEventName" name="eventName" placeholder={eventModel.name} label="Event Name" value="" limit="64" />
                </section>
                <section className="modal-fields">
                    <Select id="newEventType" name="typeId" label="Event Type" value={eventModel.type.id} options={types} isRequired />
                </section>
                <section className="modal-fields">
                    <DateTime id="newEventStart" name="eventStartDate" label="Event Start" value="" includeTime isRequired >
                        <DateTime id="newEventEnd" name="eventEndDate" label="Event End" value="" includeTime isRequired />
                    </DateTime>
                </section>
            </Form>
            <section className="modal-buttons">
                <Link href="./"><button>Cancel</button></Link>
                <button name="submit" form="new-event-modal-form">Create Event</button>
            </section>
        </ModalWrapper>
    )
}