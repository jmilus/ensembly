import 'server-only'

import Link from 'next/link';

import { getOneEventModel } from '@/api/calendar/event/model/[model]/route';
import { getManyEventModels } from '@/api/calendar/event/model/route';
import { getAllEventTypes } from '@/api/calendar/event/types/route';
import { getManyLineups } from '@/api/ensembles/[id]/lineup/route';
import { getOneAddress } from '@/api/address/[id]/route';

import { Form, Number, Text, DateTime, DateOnly, Select, Collection, Button } from 'components/Vcontrols';
import { EventNode } from 'components/Calendar';
import ModalButton from 'components/ModalButton';
import FilterContainer from 'components/FilterContainer';
import { LineupsGrid } from '../../../CalendarHelpers';
import ItemCard from 'components/ItemCard';

import CALENDAR from 'utils/calendarUtils';
import { CAL } from 'utils/constants';

const generateOccurrences = () => {
    const occurrences = {}
    CAL.weekday.long.forEach((ws, i) => {
        occurrences[ws] = {
                id: i,
                value: ws,
                period: 1,
                caption: ws,
                short: ws
            }
    })
    for (let x = 1; x <= 31; x++) {
        occurrences[`m-${x}`] = {
                id: x.toString(),
                value: x.toString(),
                period: 2,
                caption: x.toString(),
                short: x.toString()
            }
    }
    return occurrences;
}

export const ModelNode = ({ model, inheritedStyle }) => {

    return (
        <Link href={`/e/calendar/event/model/${model.id}`}>
            <div className="event-node model" style={{...inheritedStyle, ["--node-color"]: model.type.color}}>
                <span><i>arrow_circle_up</i> <span>{model.name}</span></span>
                <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(model.modelStartDate)}</span>
            </div>
        </Link>
    )
}

const createEventNodes = (model) => {
    let lineupsObj = {};
    let nodes = model.events.map((event, e) => {
        event.lineups.forEach(lineup => {
            if (lineupsObj[lineup.id]) {
                lineupsObj[lineup.id].instances++;
            } else {
                
                lineupsObj[lineup.id] = { ...lineup, instances: 1 }
            }
        })
        
        return (
            <EventNode
                key={e}
                event={event}
                color={model.type.color}
                caption={`${new Date(event.eventStartDate).toDateString()} - ${event.name || ""}`}
                showDate
                inheritedStyle={{ fontSize: "1em" }}
                sortDate={event.eventStartDate}
            />
        )
    })
    return nodes;
}


const EventModelPage = async (context) => {
    const model = await getOneEventModel(context.params.model);
    const eventTypes = await getAllEventTypes();
    const lineups = await getManyLineups();
    const address = await getOneAddress(model.location);

    const parentModel = model.parent ? await getOneEventModel(model.parent) : null;
    const childModels = await getManyEventModels({ parent: model.id });

    let eventNodes = createEventNodes(model)
        
    // const modelLineups = model.events.map(event => event.lineups).flat()
    let modelLineups = {}
    const eventCount = model.events.length
    model.events.forEach(event => {
        event.lineups.forEach(lineup => {
            if (!modelLineups[lineup.id]) modelLineups[lineup.id] = {...lineup, events: [], count: 0}
            modelLineups[lineup.id].count = modelLineups[lineup.id].count + 1
            modelLineups[lineup.id].events = [...modelLineups[lineup.id].events, event]
        })
    })
    Object.values(modelLineups).forEach(mlu => {
        if (mlu.count < eventCount) mlu.extraClass = "partial";
    })

    let parentLineups = [];
    if (parentModel) {

        parentLineups = parentModel.events.map(event => {
            return event.lineups.map(lineup => lineup.id)
        }).flat()

        eventNodes.push(
            <ModelNode
                key={"p1"}
                model={parentModel}
                showDate
                sortDate={parentModel.modelStartDate}
            />
        )
    }

    let assignments = {}
    model.events.forEach(event => {
        event.lineups.forEach(lineup => {
            lineup.assignments.forEach(as => {
                assignments[as.EnsembleMembership.id] = {
                    membership: as.EnsembleMembership,
                    division: as.Division
                }
            })
        })
    })
    
    childModels.forEach((cmodel, m) => {
        eventNodes.push( <ModelNode key={`c-${m}`} model={cmodel} showDate sortDate={cmodel.modelStartDate} /> )
    })
    
    eventNodes.sort((event1, event2) => {
        return -CALENDAR.compareDates(event1.props.sortDate, event2.props.sortDate);
    })

    const minStartdate = CALENDAR.getDashedValue(new Date(model.modelStartDate), true)
    const dateArray = model.recurrenceEndDate?.split('-')
    const recEndDate = dateArray ? CALENDAR.getDashedValue(new Date(dateArray[0], dateArray[1]-1, dateArray[2]), true) : ""
    
    const occurrenceOptionsSet = generateOccurrences()
    
    const formatOccurrenceValues = () => {
        const occ = Array.isArray(model.occurrence) ? model.occurrence : [model.occurrence];
        return Object.values(occurrenceOptionsSet).filter(ocs => occ.includes(ocs.value))
    }

    const occurrenceValues = formatOccurrenceValues()

    return (
        <>
            <div className="page-header">
                <Form id="event-model-name-form" auto >
                    <Text id="event-model-title" name="name" value={model.name} hero isRequired />
                </Form>
            </div>
            <div className="page-grid" style={{gridTemplateAreas: "'basic events' 'address events' 'lineups .'"}}>
                    <fieldset style={{gridArea: "basic"}}>
                        <legend>Basic Details</legend>
                        <Form id="event-details" auto >
                            <section className="inputs">
                                <DateTime id="startDate" name="modelStartDate" label="Start" value={model.modelStartDate} includeTime isRequired>
                                    <DateTime id="endDate" name="modelEndDate" label="End" value={model.modelEndDate} includeTime isRequired/>
                                </DateTime>
                            </section>
                            <Select id="eventType" name="type" label="Event Type" value={model.type.id} options={eventTypes} isRequired/>
                            <Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                        </Form>
                        
                        {/* <button onClick={() => fetch(`/api/events/deleteEventModelRecurrence?id=${model.id}`)} >Remove Recurrence</button> */}
                    </fieldset>
                    <fieldset style={{gridArea: "address"}}>
                        <legend>Event Address</legend>
                        <Form id="event-location" APIURL={`/api/address/${model.location}`} METHOD="PUT">
                            <Text id="street1" name="street" label="Street" value={address?.street || ""} />
                            <Text id="street2" name="street2" label="Street 2" value={address?.street2 || ""} />
                            <section className="inputs">
                                <Text id="city" name="city" label="City" value={address?.city || ""} style={{ flex: 5 }} />
                                <Text id="state" name="state" label="State" value={address?.state || ""} />
                                <Text id="postalCode" name="postalCode" label="Zip Code" value={address?.postalCode || ""} style={{ flex: 2 }}/>
                            </section>
                        </Form>
                    </fieldset>
                    <fieldset style={{gridArea: "events"}}>
                        <legend>Events</legend>
                        <section className="button-tray">
                            <ModalButton
                                title="Add Event to Model"
                                modalButton={<><i>event</i><span>Add Event</span></>}
                                buttonClass="fit"
                            >
                                <Form id="new-event-modal-form" APIURL={`/api/calendar/event/model/${model}`} METHOD="POST" auxData={{exception: true}} >
                                    <section className="modal-fields">
                                        <Text id="newEventName" name="eventName" placeholder={model.name} label="Event Name" value="" limit="64" />
                                    </section>
                                    <section className="modal-fields">
                                        <Select id="newEventType" name="typeId" label="Event Type" value={model.type.id} options={eventTypes} isRequired />
                                    </section>
                                    <section className="modal-fields">
                                        <DateTime id="newEventStart" name="eventStartDate" label="Event Start" value="" includeTime isRequired >
                                            <DateTime id="newEventEnd" name="eventEndDate" label="Event End" value="" includeTime isRequired />
                                        </DateTime>
                                    </section>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="new-event-modal-form">Create Event</button>
                                </section>
                            </ModalButton>
                            <ModalButton
                                title="Create Supporting Event"
                                modalButton={<><i>add_box</i><span>Create Supporting Event</span></>}
                                buttonClass="fit"
                            >
                                <Form id="new-supporting-event-form" METHOD="POST" APIURL="/api/calendar/event/model" auxData={{ parent: model }}>
                                    <section className="modal-fields">
                                        <Text id="newModelName" name="modelName" label="Model Name" value="" limit="64" isRequired />
                                    </section>
                                    <section className="modal-fields">
                                        <Select id="newEventType" name="type" label="Event Type" value="" options={eventTypes} isRequired />
                                    </section>
                                    <section className="modal-fields">
                                        <DateTime id="newEventStart" name="modelStartDate" label="Event Start" value="" includeTime isRequired >
                                            <DateTime id="newEventEnd" name="modelEndDate" label="Event End" value="" includeTime isRequired />
                                        </DateTime>
                                    </section>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="new-supporting-event-form">Create Event</button>
                                </section>
                            </ModalButton>
                            <ModalButton
                                title="Set Recurrence"
                                modalButton={<><i>event</i><span>Set Recurrence</span></>}
                                buttonClass="fit"
                            >
                                <Form id="event-recurrence" METHOD="PUT" debug >
                                    <section className="modal-fields" style={{width:"600px"}}>
                                        <Number id="recurrence-interval" name="interval" label="Every" value={model.interval || 1} style={{maxWidth: "75px"}} isRequired />
                                        <Select id="recurrence-period" name="period" label="Period" value={model.period || 1} options={[{ id: 1, caption: "Week" }, { id: 2, caption: "Month" }]} isRequired style={{maxWidth:"100px"}} >
                                            <Collection id="recurrence-occurrence" name="occurrence" label="Occurrence" value={occurrenceValues} options={occurrenceOptionsSet} filterKey="period" isRequired debug />
                                        </Select>
                                    </section>
                                    <section className="modal-fields">
                                        <DateOnly id="recurrence-end-date" name="recurrenceEndDate" label="End Recurrence" value={recEndDate || minStartdate} min={minStartdate} isRequired />
                                    </section>
                                </Form>
                                <section className="modal-buttons">
                                    <button name="submit" form="event-recurrence">Save</button>
                                </section>
                            </ModalButton>
                        </section>
                        <article className="scroll" style={{padding:"5px"}}>
                            { eventNodes }
                        </article>
                    </fieldset>
                    <fieldset style={{gridArea: "lineups"}}>
                        <legend>Lineups</legend>
                        <section className="button-tray">
                            {parentLineups.length > 0 &&
                                <Button label="Apply Parent Lineups" buttonClass="fit" APIURL="/api/calendar/event" METHOD="PUT" payload={{ events: model.events.map(event => event.id), lineups: parentLineups }} />
                            }
                            <LineupsGrid model={model} allLineups={lineups}/>
                            <ModalButton
                                title="View Assigned Members"
                                modalButton={<><i>groups</i><span>View Assigned Members</span></>}
                                buttonClass="fit"
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
                                                    name={assignment.membership.Member.aka}
                                                    subtitle={assignment.division.name}
                                                />
                                            )
                                        })
                                    }
                                </FilterContainer>
                            </ModalButton>
                        </section>
                        <Form id="events-lineups" APIURL="/api/calendar/event" METHOD="PUT" auxData={{route: "all", initialLineups: Object.keys(modelLineups), events: model.events.map(ev => ev.id)}} auto>
                            <Collection id="all-events-lineups" name="lineups" label="All Event Lineups" value={modelLineups} options={lineups} />
                        </Form>
                    </fieldset>
            </div>
        </>
    )
}

export default EventModelPage;