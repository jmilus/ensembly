import { useEffect, useState, useContext, useRef } from 'react';
import useLoader from '../../../hooks/useLoader';

import Link from 'next/link';
import Meta from '../../../components/Meta';

import VForm from '../../../components/VForm';
import V from '../../../components/ControlMaster';
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
    const [hasRecurrence, setHasRecurrence] = useState(initialProps.model.recEndCount > 1);

    console.log({model});

    useLoader(model.id, setModel, `/api/events/getOneEventModel?id=${model.id}`);

    const updateEvent = (data) => {
        const records = data[0];
        const updatedEvent = JSON.parse(JSON.stringify(records[records.length - 1]))
        // updatedEvent.events = records.slice(1).map(event => event)
        setModel(updatedEvent);
    }

    const occurrences = []
    for (let i = 0; i <= 6; i++){
        occurrences.push({ id: CAL.weekday.short[i], value: i, period: "Week", name: CAL.weekday.long[i], short: CAL.weekday.short[i], mini: CAL.weekday.short[i].slice(0,2) })
    }

    for (let x = 1; x <= 31; x++) {
        occurrences.push({id: x.toString(), value: x, period: "Month", name: x.toString(), short: x.toString()})
    }

    const recurrence = 
        <section>
            <V.Number id="recurrence-interval" field="interval" label="Recurs Every" value={model.interval} initialValue={1} isRequired />
            <V.Select id="recurrence-period" field="period" label="Period" value={model.period} options={Period} initialValue="Week" isRequired >
                <V.Multi id="recurrence-occurrence" field="occurrence" label="Occurrence" value={model.occurrence} initialValue={[]} options={occurrences} filterKey="period" isRequired debug />
            </V.Select>
            <V.Date id="recurrence-end-date" field="recEndDate" label="End Recurrence" value={model.recEndDate} initialValue={model.modEndDate} isRequired />
        </section>

    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <VForm id="event-name" APIURL="/events/updateEventModel" recordId={model.id} >
                        <V.Text id="name" field="name" value={model.name} hero isRequired limit="64" />
                    </VForm>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <Grid columns="2">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <VForm id="event-details" APIURL="/events/updateEventModel" recordId={model.id} context={model} followUp={updateEvent}>
                                <section>
                                    <V.Date id="startDate" field="modStartDate" label="Start" value={model.modStartDate} includeTime isRequired>
                                        <V.Date id="endDate" field="modEndDate" label="End" value={model.modEndDate} includeTime isRequired/>
                                    </V.Date>
                                </section>
                                <V.Select id="eventType" field="eventType" label="Event Type" value={model.eventType.id} options={initialProps.eventTypes} isRequired />
                                <V.Text id="eventDetails" field="details" label="Details" value={model.details} limit="1000" />
                                <V.Check id="recurrence" field="show-recurrence" label="Recurring Event" updateForm={(r) => setHasRecurrence(r["show-recurrence"])} value={ model.interval > 0 } />
                                {hasRecurrence && recurrence}
                            </VForm>
                        </fieldset>
                        <fieldset className="grid-rows-2">
                            <legend>Events</legend>
                            {
                                model.events.map(event => {
                                    event.model = {}
                                    event.model.name = new Date(event.startDate).toDateString();
                                    event.model.eventType = model.eventType;
                                    return (
                                        <EventNode event={event} showDate inheritedStyle={{ fontSize: "1em" }} />
                                    )
                                })
                            }
                        </fieldset>
                        <fieldset>
                            <legend>Event Address</legend>
                            <VForm id="event-location" APIURL="/general/updateAddress" additionalIds={{ modelId: model.id }} recordId={model.location?.id}>
                                <V.Text id="street1" field="street" label="Street" value={model.location?.street} />
                                <V.Text id="street2" field="street2" label="Street 2" value={model.location?.street2} />
                                <section>
                                    <V.Text id="city" field="city" label="City" value={model.location?.city} inheritedStyles={{ flex: 5 }} />
                                    <V.Text id="state" field="state" label="State" value={model.location?.state} />
                                    <V.Text id="postalCode" field="postalCode" label="Zip Code" value={model.location?.postalCode} inheritedStyles={{ flex: 2 }}/>
                                </section>
                            </VForm>
                        </fieldset>
                    </Grid>
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <Link href="/events"><button className="icon-and-label"><i>arrow_back</i>Back to Calendar</button></Link>
            </div>
        </div>
    )
}

export default ModelProfile;