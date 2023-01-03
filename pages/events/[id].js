import { useEffect, useState, useContext, useRef } from 'react';
import useLoader from '../../hooks/useLoader';

import Link from 'next/link';
import Meta from '../../components/Meta';

import VForm from '../../components/VForm';
import V from '../../components/ControlMaster';
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

const eventProfile = (initialProps) => {
    const { dispatch } = useContext(GlobalContext);
    const [event, setEvent] = useState(initialProps.event);
    const [addressException, setAddressException] = useState(initialProps.event.location != undefined);

    console.log({event});

    // useLoader(event.id, setEvent, `/api/events/getOneEvent?id=${event.id}`);

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
                <VForm id="event-location" APIURL="/general/updateAddress" additionalIds={{ eventId: event.id }} recordId={event.location?.id}>
                    <V.Text id="street1" field="street" label="Street" value={event.location?.street} />
                    <V.Text id="street2" field="street2" label="Street 2" value={event.location?.street2} />
                    <section>
                        <V.Text id="city" field="city" label="City" value={event.location?.city} inheritedStyles={{ flex: 5 }} />
                        <V.Text id="state" field="state" label="State" value={event.location?.state} />
                        <V.Text id="postalCode" field="postalCode" label="Zip Code" value={event.location?.postalCode} inheritedStyles={{ flex: 2 }}/>
                    </section>
                </VForm>
            </>
        
    } else {
        locationAddress = 
            <>
                <button onClick={() => setAddressException(true)}>Change Address for This Date</button>
                <V.Text id="street1" field="street" label="Street" value={event.model.location?.street} readonly />
                <V.Text id="street2" field="street2" label="Street 2" value={event.model.location?.street2} readonly />
                <section>
                    <V.Text id="city" field="city" label="City" value={event.model.location?.city} inheritedStyles={{ flex: 5 }} readonly />
                    <V.Text id="state" field="state" label="State" value={event.model.location?.state} readonly />
                    <V.Text id="postalCode" field="postalCode" label="Zip Code" value={event.model.location?.postalCode} inheritedStyles={{ flex: 2 }} readonly />
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
                    <V.Text id="name" field="name" value={event.model.name} hero isRequired limit="64" readonly/>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <Grid columns="2">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <VForm id="event-details" APIURL="/events/updateEvent" recordId={event.id} >
                                <section>
                                    <V.Date id="startDate" field="startDate" label="Start" value={event.startDate} includeTime debug >
                                        <V.Date id="endDate" field="endDate" label="End" value={event.endDate} includeTime/>
                                    </V.Date>
                                </section>
                                <V.Select id="eventType" field="eventType" label="Event Type" value={event.model.eventType.id} options={initialProps.eventTypes} readonly />
                                <V.Text id="eventDetails" field="details" label="Details" value={event.model.details} limit="1000" readonly />
                            </VForm>
                        </fieldset>
                        <fieldset className="grid-rows-2">
                            <legend>Note</legend>
                            <VForm id="event-note" APIURL="/events/updateEvent" recordId={event.id} >
                                <V.Text id="eventNote" field="note" value={event.note} limit="1000" />
                            </VForm>
                        </fieldset>
                        <fieldset>
                            <legend>Event Address</legend>
                            {locationAddress}
                        </fieldset>
                    </Grid>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <Link href="/events"><button className="icon-and-label"><i>arrow_back</i>Back to Calendar</button></Link>
                <Link href={`/events/eventmodel/${event.model.id}`}><button className="icon-and-label"><i>calendar_month</i>Event Model</button></Link>
                {revertButton}
            </div>
        </div>
    )
}

export default eventProfile;