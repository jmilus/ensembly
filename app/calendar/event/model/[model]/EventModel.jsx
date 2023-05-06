'use client'

import { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import useLoader from '../../../hooks/useLoader';

import {Form, Text, Select, Date, Number} from '../../../../../components/Vcontrols';
import Grid from '../../../../../components/Grid';
import { EventNode } from '../../../../../components/Calendar';

import { Period } from '@prisma/client';

import { GlobalContext } from "../../../../../components/ContextFrame";

import { CAL } from '../../../../../utils/constants';

const ModelProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    const [model, setModel] = useState(initialProps.model);
    const [hasRecurrence, setHasRecurrence] = useState( initialProps.model.events.length > 1);
    const router = useRouter();

    console.log({model}, {hasRecurrence});

    // useLoader(model.id, setModel, `/api/events/getOneEventModel?id=${model.id}`);

    const updateEvent = (record) => {
        console.log("update event data:", record)
        const updatedEventModel = JSON.parse(JSON.stringify(record))
        console.log({updatedEventModel})
        setModel(updatedEventModel);
    }

    const updateRecurrence = (records) => {
        console.log("update recurrence data:", records)
        // const records = data[0];
        const updatedEventModel = JSON.parse(JSON.stringify(records[records.length - 1]))
        console.log({updatedEventModel})
        updatedEventModel.events = records.slice(0, -1).map(event => event)
        setModel(updatedEventModel);
    }

    const occurrences = []
    for (let i = 0; i <= 6; i++){
        occurrences.push({ id: CAL.weekday.short[i], value: CAL.weekday.short[i], period: "Week", name: CAL.weekday.long[i], short: CAL.weekday.short[i], mini: CAL.weekday.short[i].slice(0,2) })
    }

    for (let x = 1; x <= 31; x++) {
        occurrences.push({id: x.toString(), value: x, period: "Month", name: x.toString(), short: x.toString()})
    }

    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.actionSection}>
                <button className="icon-and-label" onClick={() => router.push("/events")}><i>arrow_back</i>Back to Calendar</button>
            </div>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <Form id="event-name" APIURL="/events/updateEventModel" recordId={model.id} auto >
                        <Text id="name" name="name" value={model.name} hero isRequired limit="64" />
                    </Form>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <Grid columns="2">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <Form id="event-details" APIURL="/events/updateEventModel" recordId={model.id} followUp={updateEvent} auto debug >
                                <section>
                                    <Date id="startDate" name="modStartDate" label="Start" value={model.modStartDate} includeTime isRequired>
                                        <Date id="endDate" name="modEndDate" label="End" value={model.modEndDate} includeTime isRequired/>
                                    </Date>
                                </section>
                                <Select id="eventType" name="eventType" label="Event Type" value={model.eventType.id} options={initialProps.eventTypes} isRequired/>
                                <Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                            </Form>
                            {!hasRecurrence && <button onClick={() => setHasRecurrence(true)}>Create Recurrence</button>}
                            {hasRecurrence &&
                                <>
                                    <Form id="event-recurrence" APIURL="/events/updateEventModelRecurrence" recordId={model.id} additionalIds={{ modStartDate: model.modStartDate, modEndDate: model.modEndDate }} timeout={2000} followUp={updateRecurrence} auto debug>
                                        <section>
                                            <Number id="recurrence-interval" name="interval" label="Recurs Every" value={model.interval || 1} isRequired />
                                            <Select id="recurrence-period" name="period" label="Period" value={model.period || "Week"} options={Period} isRequired >
                                                <Select id="recurrence-occurrence" name="occurrence" label="Occurrence" value={model.occurrence} options={occurrences} filterKey="period" isRequired multiselect/>
                                            </Select>
                                            <Date id="recurrence-end-date" name="recEndDate" label="End Recurrence" value={model.recEndDate} isRequired />
                                        </section>
                                    </Form>
                                    <button onClick={() => fetch(`/api/events/deleteEventModelRecurrence?id=${model.id}`)} >Remove Recurrence</button>
                                </>
                            }
                        </fieldset>
                        <fieldset className="grid-rows-2">
                            <legend>Events</legend>
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
                    </Grid>
                </div>
            </div>
        </div>
    )
}

export default ModelProfile;