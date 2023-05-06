'use client'

import Link from 'next/link';

import {Form, Text, Select, DateTime} from '../../components/Vcontrols';

import CALENDAR from '../../utils/calendarUtils';
import Modal2 from '../../components/Modal2';

export function CalendarNav({ensembles, eventTypes}) {

    const newEventModal = 
        <Form id="new-event-modal-form" APIURL="/events/createEvent" followPath={(r) => `/calendar/event/model/${r["eventModelId"]}`} debug>
            <section className="modal-fields">
                <Text id="newEventName" name="modelName" label="Event Name" value="" limit="64" isRequired/>
            </section>
            <section className="modal-fields">
                <Select id="newEventType" name="typeId" label="Event Type" value="" options={eventTypes} isRequired />
            </section>
            <section className="modal-fields">
                <DateTime id="newEventStart" name="startDate" label="Event Start" value="" includeTime isRequired>
                    <DateTime id="newEventEnd" name="endDate" label="Event End" value="" includeTime isRequired/>
                </DateTime>
            </section>
            <section className="modal-buttons">
                <button name="submit">Create Event</button>
                <button >Cancel</button>
            </section>
        </Form>

    return (
        <article style={{padding: "10px"}}>
            <h1>Calendar</h1>
            <Modal2
                modalButton={<button className="fat"><i>event</i><span>New Event</span></button>}
                title="Create New Event"
            >
                {newEventModal}
            </Modal2>
        </article>
    )
}

const revertToModel = async (event) => {
    console.log("reverting...");
    const revertStart = new Date(event.anchorDate);
    const eventDuration = new Date(event.model.modEndDate).valueOf() - new Date(event.model.modStartDate).valueOf();
    revertStart.setHours(new Date(event.model.modStartDate).getHours(), new Date(event.model.modStartDate).getMinutes());
    const revertEnd = new Date(new Date(revertStart).valueOf() + eventDuration);
    
    const revertedEvent = await fetch("/api/events/updateEvent", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: event.id,
            startDate: revertStart,
            endDate: revertEnd,
            exception: false
        })
    })
            .then(response => response.json())
            .then(record => {
                console.log({ record });
                return record;
            })
            .catch((err, message) => {
                console.error('Could not revert event...', message);
                return err;
            })

    if (!revertedEvent.err) setEvent(revertedEvent);

}

export function EventNav({event}) {

    return (
        <article style={{ padding: "10px" }}>
            <Link href="/calendar"><i>arrow_back</i>Calendar</Link>
            <h1>Event Details</h1>
            <Link href={`/calendar/event/model/${event.model.id}`}>
                <button className="fat icon-and-label"><i>dynamic_feed</i>Event Model</button>
            </Link>
            {event.exception &&
                <button className="icon-and-label" onClick={() => revertToModel(event)}><i>undo</i>Revert to Model</button>
            }
        </article>
    )

}

export function ModelNav({model}) {

    return (
        <article style={{ padding: "10px" }}>
            <Link href="/calendar"><i>arrow_back</i>Calendar</Link>
            <h1>Event Model</h1>
            
        </article>
    )

}