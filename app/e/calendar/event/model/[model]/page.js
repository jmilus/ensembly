import 'server-only'

import Link from 'next/link';

import { getOneEventModel } from '@/api/calendar/event/model/[model]/route';
import { getManyEventModels } from '@/api/calendar/event/model/route';
import { getAllEventTypes } from '@/api/calendar/event/types/route';
import { getManyLineups } from '@/api/ensembles/[id]/lineup/route';

import { Form, Number, Text, DateTime, DateOnly, Select, Collection, Button } from 'components/Vcontrols';
import { EventNode } from 'components/Calendar';
import ModalButton from 'components/ModalButton';
import FilterContainer from 'components/FilterContainer';
import { LineupsGrid } from '../../../CalendarHelpers';
import ItemCard from 'components/ItemCard';
import { listModelLineups } from 'utils/lineupHelpers';

import CALENDAR from 'utils/calendarUtils';
import { CAL } from 'utils/constants';

const generateOccurrences = () => {
    const occurrences = {}
    CAL.weekday.long.forEach((ws, i) => {
        occurrences[ws] = {
                id: i,
                value: ws,
                period: "Week",
                caption: ws,
                short: ws
            }
    })
    for (let x = 1; x <= 31; x++) {
        occurrences[`m-${x}`] = {
                id: x.toString(),
                value: x.toString(),
                period: "Month",
                caption: x.toString(),
                short: x.toString()
            }
    }
    return occurrences;
}

export const ModelNode = ({ caption, model, style }) => {

    return (
        <Link href={`/e/calendar/event/model/${model.id}`} className="event-node model" style={{ ...style, ["--node-color"]: `hsl(${model.type.color})` }}>
            {caption}
            <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(model.modelStartDate)}</span>
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
                style={{ fontSize: "1em", marginLeft: model.parent ? "10px" : "0px" }}
                sortDate={event.eventStartDate}
            />
        )
    })
    return nodes;
}


const EventModelPage = async (context) => {
    const model = await getOneEventModel(context.params.model);
    console.log("model:", model)
    const eventTypes = await getAllEventTypes();
    const lineups = await getManyLineups();

    const parentModel = model.parent ? await getOneEventModel(model.parent) : null;
    const childModels = await getManyEventModels({ parent: model.id });

    let eventNodes = createEventNodes(model)
    
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
        let lineStyle = mlu.count < eventCount ? "none" : "solid";
        mlu.extraStyle = { outlineStyle: lineStyle }
    })

    const parentLineups = parentModel ? listModelLineups(parentModel) : [];
    const applyParentLineupsButton = <Button
        buttonClass="fit"
        APIURL={`/api/calendar/event/model/${model.id}/lineups`}
        METHOD="POST"
        payload={parentLineups}
        json
    ><i>move_down</i><span>Apply Parent Lineups</span></Button>;

    if (parentModel) { 
        eventNodes.push(
            <ModelNode
                key={"p1"}
                caption={<><i>publish</i><span>{new Date(parentModel.modelStartDate).toDateString()} | {model.name}</span></>}
                model={parentModel}
                showDate
                sortDate={parentModel.modelStartDate}
                style={{margin: "0px"}}
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
    
    childModels.forEach((childModel, m) => {
        eventNodes.push(
            <ModelNode
                key={`c-${m}`}
                caption={<><i>subdirectory_arrow_right</i><span>{new Date(childModel.modelStartDate).toDateString()} | {childModel.name}</span></>}
                model={childModel}
                showDate
                sortDate={childModel.modelStartDate}
                style={{ marginLeft: parentModel ? "20px" : "10px" }}
            />
        )
    })
    
    eventNodes.sort((event1, event2) => {
        return -CALENDAR.compareDates(event1.props.sortDate, event2.props.sortDate);
    })

    const minStartdate = CALENDAR.getDashedValue(new Date(model.modelStartDate), true)
    const dateArray = model.recurrenceEndDate?.split('-')
    const recEndDate = dateArray ? CALENDAR.getDashedValue(new Date(dateArray[0], dateArray[1]-1, dateArray[2]), true) : ""
    
    const occurrenceOptionsSet = generateOccurrences()
    console.log({occurrenceOptionsSet})
    
    const formatOccurrenceValues = () => {
        const occ = Array.isArray(model.occurrence) ? model.occurrence : [model.occurrence];
        return Object.values(occurrenceOptionsSet).filter(ocs => occ.includes(ocs.value))
    }

    const occurrenceValues = formatOccurrenceValues()

    return (
        <>
            <div id="record-header">
                <div className="hero-text" style={{marginRight:"10px"}}>Event Model:</div>
                <Form id="event-model-name-form" auto >
                    <Text id="event-model-title" name="name" value={model.name} hero isRequired />
                </Form>
            </div>
            <div className="page-grid" style={{gridTemplateAreas: "'basic events' 'address events' 'lineups .'"}}>
                <fieldset style={{gridArea: "basic"}}>
                    <legend>Basic Details</legend>
                    <Form id="event-details" auto >
                        <section className="inputs">
                            <DateTime id="startDate" name="modelStartDate" label="Start" value={model.modelStartDate} includeTime isRequired >
                                <DateTime id="endDate" name="modelEndDate" label="End" value={model.modelEndDate} includeTime isRequired/>
                            </DateTime>
                        </section>
                        <Select id="eventType" name="type" label="Event Type" value={model.type.type} options={eventTypes} isRequired debug/>
                        <Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                    </Form>
                    
                    {/* <button onClick={() => fetch(`/api/events/deleteEventModelRecurrence?id=${model.id}`)} >Remove Recurrence</button> */}
                </fieldset>
                <fieldset style={{gridArea: "address"}}>
                    <legend>Event Address</legend>
                    <Form id="event-location" APIURL={`/api/address/${model.address?.id || "new"}`} METHOD="PUT" auxData={{ model: model.id }} auto>
                        <Text id="street1" name="street" label="Street" value={model.address?.street || ""} />
                        <Text id="street2" name="street2" label="Street 2" value={model.address?.street2 || ""} />
                        <section className="inputs">
                            <Text id="city" name="city" label="City" value={model.address?.city || ""} style={{ flex: 5 }} />
                            <Text id="state" name="state" label="State" value={model.address?.state || ""} />
                            <Text id="postalCode" name="postalCode" label="Zip Code" value={model.address?.postalCode || ""} style={{ flex: 2 }}/>
                        </section>
                    </Form>
                </fieldset>
                <fieldset style={{gridArea: "events"}}>
                    <legend>Events</legend>
                    <section className="button-tray">
                        <ModalButton
                            title="Add Event to Model"
                            renderButton={<><i>event</i><span>Add Event</span></>}
                            buttonClass="fit"
                        >
                            <Form id="new-event-modal-form" APIURL={`/api/calendar/event/model/${model.id}`} METHOD="POST" auxData={{exception: true}} >
                                <Text id="newEventName" name="eventName" placeholder={model.name} label="Event Name" value="" limit="64" />
                                {/* <Select id="newEventType" name="typeId" label="Event Type" value={model.type.id} options={eventTypes} isRequired /> */}
                                <section className="inputs">
                                    <DateTime id="newEventStart" name="eventStartDate" label="Event Start" value="" includeTime isRequired >
                                        <DateTime id="newEventEnd" name="eventEndDate" label="Event End" value="" includeTime isRequired />
                                    </DateTime>
                                </section>
                            </Form>
                            <section className="modal-buttons">
                                <button name="submit" className="fit" form="new-event-modal-form">Create Event</button>
                            </section>
                        </ModalButton>
                        <ModalButton
                            title="Create Supporting Event"
                            renderButton={<><i>add_box</i><span>Create Supporting Event</span></>}
                            buttonClass="fit"
                        >
                            <Form id="new-supporting-event-form" METHOD="POST" APIURL="/api/calendar/event/model" auxData={{ parent: model.id }}>
                                <Text id="newModelName" name="modelName" label="Model Name" value="" limit="64" isRequired />
                                <Select id="newEventType" name="type" label="Event Type" value="" options={eventTypes} isRequired />
                                <section className="inputs">
                                    <DateTime id="newEventStart" name="modelStartDate" label="Event Start" value="" includeTime isRequired >
                                        <DateTime id="newEventEnd" name="modelEndDate" label="Event End" value="" includeTime isRequired />
                                    </DateTime>
                                </section>
                            </Form>
                            <section className="modal-buttons">
                                <button name="submit" className="fit" form="new-supporting-event-form">Create Event</button>
                            </section>
                        </ModalButton>
                        <ModalButton
                            title="Set Recurrence"
                            renderButton={<><i>event</i><span>Set Recurrence</span></>}
                            buttonClass="fit"
                        >
                            <Form id="event-recurrence" METHOD="PUT" debug >
                                <section className="inputs" style={{width:"600px"}}>
                                    <Number id="recurrence-interval" name="interval" label="Every" value={model.interval || 1} style={{maxWidth: "75px"}} isRequired />
                                    <Select id="recurrence-period" name="period" label="Period" value={model.period || "Week"} options={[{ id: 1, value: "Week", caption: "Week" }, { id: 2, value: "Month", caption: "Month" }]} isRequired style={{maxWidth:"100px"}} >
                                        <Collection id="recurrence-occurrence" name="occurrence" label="Occurrence" value={occurrenceValues} options={occurrenceOptionsSet} filterKey="period" isRequired debug/>
                                    </Select>
                                </section>
                                <DateOnly id="recurrence-end-date" name="recurrenceEndDate" label="End Recurrence" value={recEndDate || minStartdate} min={minStartdate} isRequired />
                            </Form>
                            <section className="modal-buttons">
                                <button name="submit" className="fit" form="event-recurrence">Save</button>
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
                            applyParentLineupsButton
                        }
                        <LineupsGrid model={model} allLineups={lineups}/>
                        <ModalButton
                            title="View Assigned Members"
                            renderButton={<><i>groups</i><span>View Assigned Members</span></>}
                            buttonClass="fit"
                        >
                            <FilterContainer
                                id="assigned-members-filter"
                                filterTag="assignee"
                                columns={{ c: 3, w: "200px" }}
                                search={{ label: "Search", searchProp: "caption" }}
                                Vstyle={{width: "750px"}}
                            >
                                {
                                    Object.values(assignments).map((assignment, m) => {
                                        return (
                                            <ItemCard
                                                key={m}
                                                filterTag="assignee"
                                                caption={assignment.membership.Member.aka}
                                                subtitle={assignment.division.name}
                                            />
                                        )
                                    })
                                }
                            </FilterContainer>
                        </ModalButton>
                    </section>
                    <Form id="events-lineups" APIURL="/api/calendar/event" METHOD="PUT" auxData={{initialLineups: Object.keys(modelLineups), events: model.events.map(ev => ev.id)}} auto>
                        <Collection id="all-events-lineups" name="lineups" label="All Event Lineups" value={modelLineups} options={lineups} />
                    </Form>
                </fieldset>
            </div>
        </>
    )
}

export default EventModelPage;