import 'server-only'

import Link from 'next/link';

import { fetchOneEventModel } from '../../../../../pages/api/events/getOneEventModel';
import { fetchManyEventTypes } from '../../../../../pages/api/events/getManyEventTypes';
import { updateEventModel } from '../../../../../pages/api/events/updateEventModel';
import { Period } from '@prisma/client';

import { Form, Text, DateTime, Select, Collection, Number } from '../../../../../components/Vcontrols';
import { EventNode } from '../../../../../components/Calendar';

import { ModelNav } from '../../../CalendarHelpers';

import CALENDAR from '../../../../../utils/calendarUtils';
import { CAL } from '../../../../../utils/constants';
import Modal2 from '../../../../../components/Modal2';

export const ModelNode = ({ model, inheritedStyle }) => {
    const typeColor = JSON.parse(model.eventType.color)
    // const isPast = new Date(modStartDate) < new Date();
    const eventTypeColor = `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;

    return (
        <Link href={`/calendar/event/model/${model.id}`}>
            <div className="event-node model" style={{...inheritedStyle, borderColor: eventTypeColor, color: eventTypeColor}}>
                <span>{model.name}</span>
                <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(model.modStartDate)}</span>
            </div>
        </Link>
    )
}

const EventModelPage = async (context) => {
    const model = await fetchOneEventModel(context.params.model);
    const eventTypes = await fetchManyEventTypes();

    console.log({ model }, model.ensembles)

    const occurrences = []
    for (let i = 0; i <= 6; i++){
        occurrences.push({ id: CAL.weekday.short[i], value: CAL.weekday.short[i], period: "Week", name: CAL.weekday.long[i], short: CAL.weekday.short[i], mini: CAL.weekday.short[i].slice(0,2) })
    }

    for (let x = 1; x <= 31; x++) {
        occurrences.push({id: x.toString(), value: x, period: "Month", name: x.toString(), short: x.toString()})
    }

    return (
        <div className="page-base">
            <div className="action-section">
                <ModelNav model={model} />
            </div>
            <div className="form-section">
                <div className="page-header">
                    <Form id="event-model-name-form" APIURL="api/events/updateEventModel" recordId={model.id} auto >
                        <Text id="event-model-title" name="modelName" value={model.name} hero isRequired />
                    </Form>
                </div>
                <div className="page-details">
                    <article className="scroll">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <Form id="event-details" APIURL="/events/updateEventModel" recordId={model.id} auto >
                                <section>
                                    <DateTime id="startDate" name="modStartDate" label="Start" value={model.modStartDate} includeTime isRequired>
                                        <DateTime id="endDate" name="modEndDate" label="End" value={model.modEndDate} includeTime isRequired/>
                                    </DateTime>
                                </section>
                                <Select id="eventType" name="eventType" label="Event Type" value={model.eventType.id} options={eventTypes} isRequired/>
                                <Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                            </Form>
                            <Modal2
                                modalButton={<button><i>event</i><span>Set Recurrence</span></button>}
                                title="Event Recurrence"
                            >
                                <Form id="event-recurrence" APIURL="/events/updateEventModelRecurrence" recordId={model.id} additionalIds={{ modStartDate: model.modStartDate, modEndDate: model.modEndDate }} debug>
                                    <section>
                                        <Number id="recurrence-interval" name="interval" label="Recurs Every" value={model.interval || 1} isRequired />
                                        <Select id="recurrence-period" name="period" label="Period" value={model.period || "Week"} options={Period} isRequired debug >
                                            {/* <Select id="recurrence-occurrence" name="occurrence" label="Occurrence" value={model.occurrence} options={occurrences} filterKey="period" isRequired multiselect/> */}
                                            <Collection id="recurrence-occurrence" name="occurrence" label="Occurrence" value={model.occurrence} options={occurrences} filterKey="period" isRequired />
                                        </Select>
                                        <DateTime id="recurrence-end-date" name="recEndDate" label="End Recurrence" value={model.recEndDate} isRequired />
                                    </section>
                                    <section>
                                        <button name="submit">Save</button>
                                    </section>
                                </Form>
                            </Modal2>
                            {/* <button onClick={() => fetch(`/api/events/deleteEventModelRecurrence?id=${model.id}`)} >Remove Recurrence</button> */}
                        </fieldset>
                        <fieldset>
                            <legend>Event Address</legend>
                            <Form id="event-location" APIURL="/general/updateAddress" additionalIds={{ modelId: model.id }} recordId={model.location?.id} auto>
                                <Text id="street1" name="street" label="Street" value={model.location?.street} />
                                <Text id="street2" name="street2" label="Street 2" value={model.location?.street2} />
                                <section>
                                    <Text id="city" name="city" label="City" value={model.location?.city} inheritedStyles={{ flex: 5 }} />
                                    <Text id="state" name="state" label="State" value={model.location?.state} />
                                    <Text id="postalCode" name="postalCode" label="Zip Code" value={model.location?.postalCode} inheritedStyles={{ flex: 2 }}/>
                                </section>
                            </Form>
                        </fieldset>
                    </article>
                    <article>
                        <fieldset>
                            <legend>Events</legend>
                            <section>
                                <Modal2
                                    modalButton={<button><i>event</i><span>Add Event</span></button>}
                                    title="Add Event"
                                >
                                    <Form id="new-event-modal-form" APIURL="/events/createEvent" additionalIds={{ modelId: model.id }} debug >
                                        <section className="modal-fields">
                                            <Text id="newEventName" name="eventName" label="Event Name" value="" limit="64" isRequired />
                                        </section>
                                        <section className="modal-fields">
                                            <Select id="newEventType" name="typeId" label="Event Type" value="" options={eventTypes} isRequired />
                                        </section>
                                        <section className="modal-fields">
                                            <DateTime id="newEventStart" name="startDate" label="Event Start" value="" includeTime isRequired debug >
                                                <DateTime id="newEventEnd" name="endDate" label="Event End" value="" includeTime isRequired />
                                            </DateTime>
                                        </section>
                                        <section className="modal-buttons">
                                            <button name="submit">Create Event</button>
                                            <button name="cancel">Cancel</button>
                                        </section>
                                    </Form>
                                </Modal2>
                                <Modal2
                                    modalButton={<button><i>add_box</i><span>Create Supporting Event</span></button>}
                                    title="Add Supporting Event"
                                >
                                    <Form id="new-supporting-event-form" APIURL="/events/createEvent" additionalIds={{parentModelId: model.id}} >
                                        <section className="modal-fields">
                                            <Text id="newModelName" name="modelName" label="Model Name" value="" limit="64" isRequired />
                                        </section>
                                        <section className="modal-fields">
                                            <Select id="newEventType" name="typeId" label="Event Type" value="" options={eventTypes} isRequired />
                                        </section>
                                        <section className="modal-fields">
                                            <DateTime id="newEventStart" name="startDate" label="Event Start" value="" includeTime isRequired debug >
                                                <DateTime id="newEventEnd" name="endDate" label="Event End" value="" includeTime isRequired />
                                            </DateTime>
                                        </section>
                                        <section className="modal-buttons">
                                            <button name="submit">Create Event</button>
                                            <button name="cancel">Cancel</button>
                                        </section>
                                    </Form>
                                </Modal2>
                            </section>
                            <article className="scroll">
                                {model.parentModel &&
                                    <ModelNode model={model.parentModel} showDate />
                                }
                                {
                                    model.events.map((event, e) => {
                                        event.model = {}
                                        event.model.name = new Date(event.startDate).toDateString();
                                        event.model.eventType = model.eventType;
                                        return (
                                            <EventNode key={e} event={event} showDate inheritedStyle={{ fontSize: "1em" }} />
                                        )
                                    })
                                }
                                {
                                    model.childModels?.map((model, m) => {
                                        console.log(model);
                                        return <ModelNode key={m} model={model} showDate />
                                    })
                                }
                            </article>
                        </fieldset>
                    </article>
                </div>
            </div>
        </div>
    )
}

export default EventModelPage;