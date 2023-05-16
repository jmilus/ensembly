'use client'

import Link from 'next/link';
import { useState, useContext } from 'react';

import {Form, Text, Select, DateTime, CheckBox} from '../../components/Vcontrols';
import Modal2 from '../../components/Modal2';
import { GlobalContext } from '../../components/ContextFrame';

import './calendar.css'
import useStatus from '../../hooks/useStatus';

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

export function SchemaGrid({ model, schemasInModel, initialAssignments, AllSchemas }) {
    const [schemaAssignments, setSchemaAssignments] = useState(initialAssignments);
    const status = useStatus();

    const { dispatch } = useContext(GlobalContext)

    console.log(model, schemasInModel)

    const handleChangeSchemaAssignment = (action, eventId, schemaId) => {
        let tempAssignments = { ...schemaAssignments };

        tempAssignments[eventId][schemaId] = action;
        
        setSchemaAssignments(tempAssignments)
    }

    const setAll = (schemaId) => {
        let tempAssignments = { ...schemaAssignments };

        const allChecked = Object.keys(tempAssignments).every(eventId => {
            return tempAssignments[eventId][schemaId];
        })

        Object.keys(tempAssignments).forEach(key => {
            tempAssignments[key][schemaId] = !allChecked;
        })

        setSchemaAssignments(tempAssignments);
    }

    const submitAssignments = async () => {
        dispatch({
            route: "modal",
            payload: null
        })
        status.saving();
        const apiReturn = await fetch('/api/events/updateManySchemas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schemaAssignments)
        })
            .then(response => response.json())
            .then(res => res)
            .catch((err, message) => {
                console.error("update failed", message);
                return err;
            })
        
        console.log(apiReturn);
        status.saved();
    }

    return (
        <>
            <div className="schema-grid">
                <section>
                    <div className="schema-header grid-column"></div>
                    {
                        Object.values(schemasInModel).map((ms, i) => {
                            return (
                                <div key={i} className="schema-header grid-column">
                                    <div className="column-button" onClick={() => setAll(ms.id)}>{ms.name}</div>
                                </div>
                            )
                        })
                    }
                </section>
                <article className="scroll">
                    {
                        model.events.map((event, e) => {
                            return (
                                <div key={e} className="event-row">
                                    <div className="grid-column">
                                        <div className="event-header">{new Date(event.startDate).toDateString()}</div>
                                    </div>
                                    {
                                        Object.values(schemasInModel).map((schema, s) => {
                                            const isChecked = schemaAssignments[event.id] ? schemaAssignments[event.id][schema.id] : false;
                                            return (
                                                <div key={s} className="grid-column">
                                                    <CheckBox id={`${e}-${s}`} shape="button" value={isChecked} extraAction={(action) => handleChangeSchemaAssignment(action, event.id, schema.id)} />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </article>
            </div>
            <section className="modal-buttons">
                <button name="submit" onClick={() => submitAssignments()}>Save</button>
            </section>
        </>
    )
}