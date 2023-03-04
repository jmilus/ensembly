import { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../../hooks/useLoader';

import Link from 'next/link';
import Meta from '../../../components/Meta';

import V from '../../../components/Vcontrols/VerdantControl';
import Grid from '../../../components/Grid';
import {EventNode} from '../../../components/Calendar';

import {fetchOneEventModel} from '../../api/events/getOneEventModel';
import {fetchManyEventTypes} from '../../api/events/getManyEventTypes';
import { Period } from '@prisma/client';

import { GlobalContext } from "../../_app";

import basePageStyles from '../../../styles/basePage.module.css';

import { CAL } from '../../../utils/constants';

export async function getServerSideProps(context) {
    const model = await fetchOneEventModel(context.params.model);
    const eventTypes = await fetchManyEventTypes();

    return {
        props: {
            model,
            eventTypes
        }
    }
}

const ModelProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    const [model, setModel] = useState(initialProps.model);
    const [hasRecurrence, setHasRecurrence] = useState( initialProps.model.events.length > 1);
    const router = useRouter();

    console.log({model}, {hasRecurrence});

    useLoader(model.id, setModel, `/api/events/getOneEventModel?id=${model.id}`);

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
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <V.Form id="event-name" APIURL="/events/updateEventModel" recordId={model.id} auto >
                        <V.Text id="name" name="name" value={model.name} hero isRequired limit="64" />
                    </V.Form>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <Grid columns="2">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <V.Form id="event-details" APIURL="/events/updateEventModel" recordId={model.id} followUp={updateEvent} auto debug >
                                <section>
                                    <V.Date id="startDate" name="modStartDate" label="Start" value={model.modStartDate} includeTime isRequired>
                                        <V.Date id="endDate" name="modEndDate" label="End" value={model.modEndDate} includeTime isRequired/>
                                    </V.Date>
                                </section>
                                <V.Select id="eventType" name="eventType" label="Event Type" value={model.eventType.id} options={initialProps.eventTypes} isRequired/>
                                <V.Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                            </V.Form>
                            {!hasRecurrence && <button onClick={() => setHasRecurrence(true)}>Create Recurrence</button>}
                            {hasRecurrence &&
                                <>
                                    <V.Form id="event-recurrence" APIURL="/events/updateEventModelRecurrence" recordId={model.id} additionalIds={{ modStartDate: model.modStartDate, modEndDate: model.modEndDate }} timeout={2000} followUp={updateRecurrence} auto debug>
                                        <section>
                                            <V.Number id="recurrence-interval" name="interval" label="Recurs Every" value={model.interval || 1} isRequired />
                                            <V.Select id="recurrence-period" name="period" label="Period" value={model.period || "Week"} options={Period} isRequired >
                                                <V.Select id="recurrence-occurrence" name="occurrence" label="Occurrence" value={model.occurrence} options={occurrences} filterKey="period" isRequired multiselect/>
                                            </V.Select>
                                            <V.Date id="recurrence-end-date" name="recEndDate" label="End Recurrence" value={model.recEndDate} isRequired />
                                        </section>
                                    </V.Form>
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
                            <V.Form id="event-location" APIURL="/general/updateAddress" additionalIds={{ modelId: model.id }} recordId={model.location?.id} auto>
                                <V.Text id="street1" name="street" label="Street" value={model.location?.street} />
                                <V.Text id="street2" name="street2" label="Street 2" value={model.location?.street2} />
                                <section>
                                    <V.Text id="city" name="city" label="City" value={model.location?.city} inheritedStyles={{ flex: 5 }} />
                                    <V.Text id="state" name="state" label="State" value={model.location?.state} />
                                    <V.Text id="postalCode" name="postalCode" label="Zip Code" value={model.location?.postalCode} inheritedStyles={{ flex: 2 }}/>
                                </section>
                            </V.Form>
                        </fieldset>
                    </Grid>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <button className="icon-and-label" onClick={() => router.push("/events")}><i>arrow_back</i>Back to Calendar</button>
            </div>
        </div>
    )
}

export default ModelProfile;