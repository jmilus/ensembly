import { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import Link from 'next/link';
import Meta from '../../components/Meta';

import V from '../../components/Vcontrols/VerdantControl';
import Grid from '../../components/Grid';

import {fetchOneEvent} from '../api/events/getOneEvent';
import {fetchManyEventTypes} from '../api/events/getManyEventTypes';
import { Period } from '@prisma/client';

import { GlobalContext } from "../_app";

import basePageStyles from '../../styles/basePage.module.css';

import { CAL } from '../../utils/constants';

export async function getServerSideProps(context) {
    const event = await fetchOneEvent(context.params.id);
    const eventTypes = await fetchManyEventTypes();

    return {
        props: {
            event,
            eventTypes
        }
    }
}

const EventProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    const [event, setEvent] = useState(initialProps.event);
    const [addressException, setAddressException] = useState(initialProps.event.location != undefined);
    const router = useRouter();

    console.log({event});

    useLoader(event.id, setEvent, `/api/events/getOneEvent?id=${event.id}`);

    const occurrences = CAL.weekday.long.map((d, i) => {
        return { id: d, value: i, period: "Week", name: d }
    })

    for (let x = 1; x <= 31; x++) {
        occurrences.push({id: x.toString(), value: x, period: "Month", name: x.toString()})
    }

    const revertToModel = async () => {
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

    let locationAddress, revertButton;

    if (addressException) {
        locationAddress =
            <>
                <button onClick={() => setAddressException(false)}>Revert to Event Model Location</button>
                <V.Form id="event-location" APIURL="/general/updateAddress" additionalIds={{ eventId: event.id }} recordId={event.location?.id} auto>
                    <V.Text id="street1" name="street" label="Street" value={event.location?.street} />
                    <V.Text id="street2" name="street2" label="Street 2" value={event.location?.street2} />
                    <section>
                        <V.Text id="city" name="city" label="City" value={event.location?.city} inheritedStyles={{ flex: 5 }} />
                        <V.Text id="state" name="state" label="State" value={event.location?.state} />
                        <V.Text id="postalCode" name="postalCode" label="Zip Code" value={event.location?.postalCode} inheritedStyles={{ flex: 2 }}/>
                    </section>
                </V.Form>
            </>
        
    } else {
        locationAddress = 
            <>
                <button onClick={() => setAddressException(true)}>Change Address for This Date</button>
                <V.Text id="street1" name="street" label="Street" value={event.model.location?.street} readonly />
                <V.Text id="street2" name="street2" label="Street 2" value={event.model.location?.street2} readonly />
                <section>
                    <V.Text id="city" name="city" label="City" value={event.model.location?.city} inheritedStyles={{ flex: 5 }} readonly />
                    <V.Text id="state" name="state" label="State" value={event.model.location?.state} readonly />
                    <V.Text id="postalCode" name="postalCode" label="Zip Code" value={event.model.location?.postalCode} inheritedStyles={{ flex: 2 }} readonly />
                </section>
            </>

    }

    if (event.exception) {
        revertButton = <button className="icon-and-label" onClick={revertToModel}><i>undo</i>Revert to Model</button>
    }

    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <V.Text id="name" name="name" value={event.model.name} hero isRequired limit="64" readonly/>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <Grid columns="2">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <V.Form id="event-details" APIURL="/events/updateEvent" recordId={event.id} auto >
                                <section>
                                    <V.Date id="startDate" name="startDate" label="Start" value={event.startDate} includeTime debug >
                                        <V.Date id="endDate" name="endDate" label="End" value={event.endDate} includeTime/>
                                    </V.Date>
                                </section>
                                <V.Select id="eventType" name="eventType" label="Event Type" value={event.model.eventType.id} options={initialProps.eventTypes} readonly />
                                <V.Text id="eventDetails" name="details" label="Details" value={event.model.details} limit="1000" readonly />
                            </V.Form>
                        </fieldset>
                        <fieldset className="grid-rows-2">
                            <legend>Note</legend>
                            <V.Form id="event-note" APIURL="/events/updateEvent" recordId={event.id} auto >
                                <V.Text id="eventNote" name="note" value={event.note} limit="1000" />
                            </V.Form>
                        </fieldset>
                        <fieldset>
                            <legend>Event Address</legend>
                            {locationAddress}
                        </fieldset>
                    </Grid>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <button className="icon-and-label" onClick={() => router.push("/events")}><i>arrow_back</i>Back to Calendar</button>
                <button className="icon-and-label" onClick={() => router.push(`/events/eventmodel/${event.model.id}`)}><i>calendar_month</i>Event Model</button>
                {revertButton}
            </div>
        </div>
    )
}

export default EventProfile;