import 'server-only';

import Link from 'next/link'

import { getOneEvent } from '../../../api/calendar/event/[id]/route'
import { getAllEventTypes } from '../../../api/calendar/event/types/route';
import { getManyLineups } from '../../../api/ensembles/[id]/lineup/route';
import { getAttendanceStatus } from '../../../api/calendar/event/[id]/take-attendance/route'

import { Form, DateTime, Select, Text } from '../../../../components/Vcontrols';
import SecurityWrapper from '../../../../components/SecurityWrapper';
import { Collection } from '../../../../components/Vcontrols';

const EventPage = async (context) => {
    const event = await getOneEvent(context.params.id);
    const eventTypes = await getAllEventTypes();
    const allLineups = await getManyLineups();
    const AttendanceStatus = await getAttendanceStatus()

    AttendanceStatus.sort((as1, as2) => {
        return as1.id - as2.id
    })

    return (
        <>
            <div className="page-header">
                <Form id="event-event-name-form" auto >
                    <Text id="event-event-title" label="Event Name" name="name" value={event.name || event.model.name} hero isRequired />
                </Form>
            </div>
            <div className="page-details">
                <section style={{flex: 1}}>
                    <article className="scroll">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <Form id="event-details" auto >
                                <section>
                                    <DateTime id="startDate" name="eventStartDate" label="Start" value={event.eventStartDate} includeTime >
                                        <DateTime id="endDate" name="eventEndDate" label="End" value={event.eventEndDate} includeTime/>
                                    </DateTime>
                                </section>
                            </Form>
                            <Select id="eventType" name="type" label="Event Type" value={event.model.type} options={eventTypes} readonly/>
                            <Text id="eventDetails" name="details" label="Details" value={event.model.details} limit="1000" readonly />
                        </fieldset>
                        <fieldset>
                            <legend>Event Address</legend>
                            {/* {locationAddress} */}
                        </fieldset>
                    </article>
                    <article className="scroll">
                        <fieldset id="event-note">
                            <legend>Note</legend>
                            <Form id="event-note" auto >
                                <Text id="eventNote" name="note" value={event.note} limit="1000" />
                            </Form>
                        </fieldset>
                        <fieldset>
                            <legend>Lineups</legend>
                            <section className="button-tray">
                                <Link href={`/calendar/event/${event.id}/$view-assigned`}><button className="fit"><i>groups</i><span>View Assigned Members</span></button></Link>
                                <Link href={`/calendar/event/${event.id}/$take-attendance`}><button className="fit"><i>checklist_rtl</i><span>Take Attendance</span></button></Link>
                            </section>
                            <Form id="testing-thing" APIURL="/api/calendar/event" auxData={{route: "all", initialLineups: event.lineups.map(lu => lu.id), events: [event.id]}} >
                                <Collection
                                    id="lineups"
                                    name="lineups"
                                    label="Event Lineups"
                                    value={event.lineups}
                                    options={allLineups}
                                />
                            </Form>
                        </fieldset>
                    </article>
                </section>
            </div>
        </>
    )
}

export default EventPage;