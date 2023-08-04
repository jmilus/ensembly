import { getAllEventTypes } from "../../../../api/calendar/event/types/route";

import ModalWrapper from "../../../../../components/ModalWrapper";
import { Form, Text, Select, DateTime } from '../../../../../components/Vcontrols'
import Link from "next/link";

export default async function NewEventModal() {
    const eventTypes = await getAllEventTypes();

    return (
        <ModalWrapper title="Create New Event">
            <Form id="new-event-modal-form" METHOD="POST" APIURL="/api/calendar/event/model" followPath="/calendar/event/model/$slug$" debug>
                <section className="modal-fields">
                    <Text id="newEventName" name="modelName" label="Event Name" value="" limit="64" isRequired/>
                </section>
                <section className="modal-fields">
                    <Select id="newEventType" name="type" label="Event Type" value="" options={eventTypes} isRequired />
                </section>
                <section className="modal-fields">
                    <DateTime id="newEventStart" name="modelStartDate" label="Event Start" value="" includeTime isRequired debug>
                        <DateTime id="newEventEnd" name="modelEndDate" label="Event End" value="" includeTime isRequired/>
                    </DateTime>
                </section>
            </Form>
            <section className="modal-buttons" form="new-event-modal-form">
                <Link href="./"><button>Cancel</button></Link>
                <button name="submit" form="new-event-modal-form">Create Event</button>
            </section>
        </ModalWrapper>
    )
}