import 'server-only';

import { getOneEvent } from '@/api/calendar/event/[id]/route'
import { getAllEventTypes } from '@/api/calendar/event/types/route';
import { getManyLineups } from '@/api/ensembles/[id]/lineup/route';
import { getAttendanceStatus } from '@/api/calendar/event/[id]/take-attendance/route'

import { Form, DateTime, Select, Text, Radio } from 'components/Vcontrols';
import FilterContainer from 'components/FilterContainer';
import SecurityWrapper from 'components/SecurityWrapper';
import { Collection } from 'components/Vcontrols';
import ModalButton from 'components/ModalButton';
import ItemCard from 'components/ItemCard';

const EventPage = async (context) => {
    const event = await getOneEvent(context.params.id);
    const eventTypes = await getAllEventTypes();
    const allLineups = await getManyLineups();
    const AttendanceStatus = await getAttendanceStatus()
    const eventAttendance = event.Attendance;

    AttendanceStatus.sort((as1, as2) => {
        return as1.id - as2.id
    })

    console.log({AttendanceStatus})

    const attendance = {}
    eventAttendance.forEach(ea => {
        attendance[ea.member] = ea
    })

    let assignments = {}

    event.lineups.forEach(lineup => {
        lineup.assignments.forEach(as => {
            assignments[as.EnsembleMembership.id] = {
                membership: as.EnsembleMembership,
                division: as.Division
            }
        })
    })

    console.log({assignments})

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
                                <section className="inputs">
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
                                <ModalButton
                                    title="View Assigned Members"
                                    modalButton={<><i>groups</i><span>View Assigned Members</span></>}
                                    buttonClass="fit"
                                    dismiss="Close"
                                >
                                    <FilterContainer
                                        id="assigned-members-filter"
                                        filterTag="assignee"
                                        columns={{ c: 3, w: "200px" }}
                                        search={{ label: "Search", searchProp: "name" }}
                                        Vstyle={{width: "750px"}}
                                    >
                                        {
                                            Object.values(assignments).map((assignment, m) => {
                                                return (
                                                    <ItemCard
                                                        key={m}
                                                        tag="assignee"
                                                        caption={assignment.membership.Member.aka}
                                                        subtitle={assignment.division.name}
                                                    />
                                                )
                                            })
                                        }
                                    </FilterContainer>
                                </ModalButton>
                                <ModalButton
                                    title="Take Attendance"
                                    modalButton={<><i>checklist_rtl</i><span>Take Attendance</span></>}
                                    buttonClass="fit"
                                    dismiss="Close"
                                >
                                    <FilterContainer
                                        id="attendance-filter"
                                        filterTag="attendee"
                                        columns={{ c: 1, w: "1fr" }}
                                        search={{ label: "Search", searchProp: "name" }}
                                        Vstyle={{width: "750px"}}
                                    >
                                        <div className="attendance-container">
                                            <div className="attendance-row slider">
                                                <div className="attendance-name"></div>
                                                {
                                                    AttendanceStatus.map((status, s) => {
                                                        return <div key={s} className="attendance-header radio-option">{status.type}</div>
                                                    })

                                                }
                                            </div>
                                            <article className="scroll">
                                                {
                                                    Object.values(assignments).map((assignment, m) => {
                                                        const { Member } = assignment.membership;
                                                        return (
                                                            <Form key={m} id={`${Member.id}-attendance-form`} METHOD="PUT" APIURL={`take-attendance/${Member.id}`} auto>
                                                                <div className="attendance-row" tag="attendee" name={Member.aka}>
                                                                    <div className="attendance-name">{Member.aka}</div>
                                                                    <Radio id={Member.id} name="status" value={attendance[Member.id]?.status || 1} type="slider" options={AttendanceStatus} /> {/*debug={Member.id === '0f7f9f27-7588-4d9f-91d5-9ad54dbef507'} /> */}
                                                                </div>
                                                            </Form>
                                                        )
                                                    })
                                                }
                                            </article>
                                        </div>
                                    </FilterContainer>
                                </ModalButton>
                            </section>
                            <Form id="testing-thing" APIURL="/api/calendar/event" METHOD="PUT" auxData={{route: "all", initialLineups: event.lineups.map(lu => lu.id), events: [event.id]}} auto>
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