import 'server-only';

import { fetchOneEvent } from '../../../../pages/api/events/getOneEvent';
import { fetchManyEventTypes } from '../../../../pages/api/events/getManyEventTypes';
import { fetchManySchemas } from '../../../../pages/api/ensembles/getManySchemas';
import { fetchManySchemaAssignments } from '../../../../pages/api/ensembles/getManySchemaAssignees';
import { fetchEventAttendance } from '../../../../pages/api/events/getEventAttendance';
import { AttendanceStatus } from '@prisma/client';

import { EventNav } from '../../CalendarHelpers';
import { Form, DateTime, Select, Text, Radio } from '../../../../components/Vcontrols';
import SecurityWrapper from '../../../../components/SecurityWrapper';
import { Collection } from '../../../../components/Vcontrols';
import Modal2 from '../../../../components/Modal2';
import FilterContainer from '../../../../components/FilterContainer';
import MemberCard from '../../../../components/MemberCard';

const EventPage = async (context) => {
    const event = await fetchOneEvent(context.params.id);
    const eventTypes = await fetchManyEventTypes();
    const allSchemas = await fetchManySchemas();
    const eventAttendance = await fetchEventAttendance(event.id)
    console.log({eventAttendance});

    const assignments = await fetchManySchemaAssignments(event.schemas.map(s => s.schemaId));
    console.log("schemas", event.schemas.map(s => s.schemaId))
    console.log({ assignments })

    const attendanceStatusObjects = Object.values(AttendanceStatus).map(status => {
        return {id: status, name: status}
    })
    attendanceStatusObjects.reverse();

    const viewAssignedMembersModal = 
        <Modal2
            modalButton={<button><i>groups</i><span>View Assigned Members</span></button>}
            title="Event Assigned Members"
        >
            <FilterContainer
                id="assigned-members-filter"
                filterTag="assignee"
                columns={{ c: 3, w: "200px" }}
                search={{ label: "Search", searchProp: "name" }}
                Vstyle={{width: "750px"}}
            >
                {
                    assignments.map((assignment, m) => {
                        // console.log(assignment.member )
                        const { membership } = assignment;
                        return (
                            <MemberCard
                                key={m}
                                tag="assignee"
                                membership={membership}
                                name={membership.member.aka}
                            />
                        )
                    })
                }
            </FilterContainer>
        </Modal2>
    
    const takeAttendanceModal =
        <Modal2
            modalButton={<button><i>checklist_rtl</i><span>Take Attendance</span></button>}
            title="Attendance"
        >
            <FilterContainer
                id="attendance-filter"
                filterTag="attendee"
                columns={{ c: 1, w: "1fr" }}
                search={{ label: "Search", searchProp: "name" }}
                Vstyle={{width: "750px"}}
            >
                <div className="attendance-row slider">
                    <div className="attendance-name"></div>
                    {
                        attendanceStatusObjects.map((status, s) => {
                            return <div key={s} className="attendance-header radio-option">{status.name}</div>
                        })

                    }
                </div>
                <article className="scroll">
                    {
                        assignments.map((assignment, m) => {
                            const { member } = assignment.membership;
                            return (
                                <Form key={m} id={`${member.id}-attendance-form`} APIURL="/events/updateAttendance" additionalIds={{memberId: member.id, eventId: event.id}} auto>
                                    <div className="attendance-row" tag="attendee" name={member.aka}>
                                        <div className="attendance-name">{member.aka}</div>
                                        <Radio id={member.id} name="status" value={eventAttendance[member.id] || "Uncounted"} type="slider" options={attendanceStatusObjects} debug/>
                                    </div>
                                </Form>
                            )
                        })
                    }
                </article>
            </FilterContainer>
        </Modal2>

    return (
        <SecurityWrapper module="calendar">
            <div className="page-base">
                <div className="action-section">
                    <EventNav event={event} />
                </div>
                <div className="form-section">
                    <div className="page-header">
                        <Form id="event-event-name-form" APIURL="/events/updateEvent" recordId={event.id} auto >
                            <Text id="event-event-title" label="Event Name" name="eventName" value={event.name || event.model.name} hero isRequired />
                        </Form>
                    </div>
                    <div className="page-details">
                        <section style={{flex: 1}}>
                            <article className="scroll">
                                <fieldset>
                                    <legend>Basic Details</legend>
                                    <Form id="event-details" APIURL="/events/updateEvent" recordId={event.id} auto >
                                        <section>
                                            <DateTime id="startDate" name="startDate" label="Start" value={event.startDate} includeTime >
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
                            <article className="scroll">
                                <fieldset>
                                    <legend>Note</legend>
                                    <Form id="event-note" APIURL="/events/updateEvent" recordId={event.id} auto >
                                        <Text id="eventNote" name="note" value={event.note} limit="1000" />
                                    </Form>
                                </fieldset>
                                <fieldset>
                                    <legend>Schemas</legend>
                                    <section>
                                        {viewAssignedMembersModal}
                                        {takeAttendanceModal}
                                    </section>
                                    <Form id="testing-thing" APIURL="/events/updateEventSchema" recordId={event.id} auto >
                                        <Collection
                                            id="schemas"
                                            name="schemas"
                                            label="Schemas"
                                            value={event.schemas.map(s => s.schema)}
                                            options={allSchemas}
                                        />
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