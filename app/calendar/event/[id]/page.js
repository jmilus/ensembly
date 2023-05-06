import 'server-only';

import { fetchOneEvent } from '../../../../pages/api/events/getOneEvent';
import { fetchManyEventTypes } from '../../../../pages/api/events/getManyEventTypes';
import { fetchManySchemas } from '../../../../pages/api/ensembles/getManySchemas';

import { EventNav } from '../../CalendarHelpers';
import { Form, DateTime, Select, Text } from '../../../../components/Vcontrols';
import SecurityWrapper from '../../../../components/SecurityWrapper';
import {Collection} from '../../../../components/Vcontrols';

const EventPage = async (context) => {
    const event = await fetchOneEvent(context.params.id);
    const eventTypes = await fetchManyEventTypes();
    const allSchemas = await fetchManySchemas();

    console.log(event.schemas)

    return (
        <SecurityWrapper module="calendar">
            <div className="page-base">
                <div className="action-section">
                    <EventNav event={event} />
                </div>
                <div className="form-section">
                    <div className="page-header">
                        <Form id="event-event-name-form" APIURL="api/events/updateEvent" recordId={event.id} auto >
                            <Text id="event-event-title" label="Event Name" name="eventName" value={event.name} hero isRequired />
                        </Form>
                    </div>
                    <div className="page-details">
                        <section style={{flex: 1}}>
                            <article>
                                <fieldset>
                                    <legend>Basic Details</legend>
                                    <Form id="event-details" APIURL="/events/updateEvent" recordId={event.id} auto >
                                        <section>
                                            <DateTime id="startDate" name="startDate" label="Start" value={event.startDate} includeTime debug >
                                                <DateTime id="endDate" name="endDate" label="End" value={event.endDate} includeTime/>
                                            </DateTime>
                                        </section>
                                        <Select id="eventType" name="eventType" label="Event Type" value={event.model.eventType.id} options={eventTypes} readonly/>
                                        <Text id="eventDetails" name="details" label="Details" value={event.model.details} limit="1000" readonly />
                                    </Form>
                                </fieldset>
                                <fieldset>
                                    <legend>Event Address</legend>
                                    {/* {locationAddress} */}
                                </fieldset>
                            </article>
                            <article>
                                <fieldset>
                                    <legend>Schemas</legend>
                                    <Form id="testing-thing" APIURL="/events/updateEventSchema" recordId={event.id} auto debug >
                                        <Collection
                                            id="schemas"
                                            name="schemas"
                                            label="Schemas"
                                            value={event.schemas.map(es => es.schemaId)}
                                            options={allSchemas}
                                        />
                                    </Form>
                                </fieldset>
                                <fieldset>
                                    <legend>Note</legend>
                                    <Form id="event-note" APIURL="/events/updateEvent" recordId={event.id} auto >
                                        <Text id="eventNote" name="note" value={event.note} limit="1000" />
                                    </Form>
                                </fieldset>
                            </article>
                        </section>
                    </div>
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default EventPage;