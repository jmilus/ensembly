import 'server-only'

import Link from 'next/link';

import { fetchOneEventModel } from '../../../../../pages/api/events/getOneEventModel';
import { fetchManyEventTypes } from '../../../../../pages/api/events/getManyEventTypes';
import { updateEventModel } from '../../../../../pages/api/events/updateEventModel';
import { fetchManySchemas } from '../../../../../pages/api/ensembles/getManySchemas';
import { fetchModelSchemas } from '../../../../../pages/api/ensembles/getModelSchemas';
import { fetchManySchemaAssignments } from '../../../../../pages/api/ensembles/getManySchemaAssignees';
import { Period } from '@prisma/client';

import { Form, Text, DateTime, Select, Collection, Number, Button } from '../../../../../components/Vcontrols';
import { EventNode } from '../../../../../components/Calendar';
import MemberCard from '../../../../../components/MemberCard';
import FilterContainer from '../../../../../components/FilterContainer'
import Modal2 from '../../../../../components/Modal2';

import { ModelNav, SchemaGrid } from '../../../CalendarHelpers';

import CALENDAR from '../../../../../utils/calendarUtils';
import { CAL } from '../../../../../utils/constants';

export const ModelNode = ({ model, inheritedStyle }) => {
    const typeColor = JSON.parse(model.eventType.color)
    // const isPast = new Date(modStartDate) < new Date();
    const eventTypeColor = `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;

    return (
        <Link href={`/calendar/event/model/${model.id}`}>
            <div className="event-node model" style={{...inheritedStyle, ["--node-color"]: eventTypeColor}}>
                <span><i>arrow_circle_up</i> <span>{model.name}</span></span>
                
                <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(model.modStartDate)}</span>
            </div>
        </Link>
    )
}


const EventModelPage = async (context) => {
    const model = await fetchOneEventModel(context.params.model);
    const eventTypes = await fetchManyEventTypes();
    const schemas = await fetchManySchemas();
    const parentSchemas = await fetchModelSchemas(model.parentModel?.id)

    const minStartdate = CALENDAR.getDashedValue(new Date(model.modStartDate)).slice(0,10)

    const occurrences = []
    for (let i = 0; i <= 6; i++){
        occurrences.push({ id: CAL.weekday.short[i], value: CAL.weekday.short[i], period: "Week", name: CAL.weekday.long[i], short: CAL.weekday.short[i], mini: CAL.weekday.short[i].slice(0,2) })
    }
    for (let x = 1; x <= 31; x++) {
        occurrences.push({id: x.toString(), value: x, period: "Month", name: x.toString(), short: x.toString()})
    }
    const formatOccurrenceValues = () => {
        const occ = Array.isArray(model.occurrence) ? model.occurrence : [model.occurrence];
        return occurrences.filter(ocs => occ.includes(ocs.value))
    }
    const occurrenceValues = formatOccurrenceValues()
    
    let schemasObj = {};
    let eventsList = model.events.map((event, e) => {
        event.schemas.forEach(eventSchema => {
            if (schemasObj[eventSchema.schemaId]) {
                schemasObj[eventSchema.schemaId].instances++;
            } else {

                schemasObj[eventSchema.schemaId] = { ...eventSchema.schema, instances: 1 }
            }
        })

        event.model = {}
        event.model.name = new Date(event.startDate).toDateString();
        event.model.eventType = model.eventType;
        return (
            <EventNode key={e} event={event} showDate inheritedStyle={{ fontSize: "1em" }} sortDate={event.startDate} />
        )
    })

    const assignments = await fetchManySchemaAssignments(Object.keys(schemasObj));
    const modelSchemas = Object.values(schemasObj).map(so => { return { ...so, nodeColor: so.instances < model.events.length ? "dim" : "" } })

    if (model.parentModel) eventsList.push(<ModelNode key={"p1"} model={model.parentModel} showDate sortDate={model.parentModel.modStartDate} />)
    
    model.childModels?.forEach((cmodel, m) => {
        eventsList.push( <ModelNode key={`c-${m}`} model={cmodel} showDate sortDate={cmodel.modStartDate} /> )
    })

    console.log(model.parentModel)
    eventsList.sort((event1, event2) => {
        console.log(event1.props.sortDate, event2.props.sortDate)
        return -CALENDAR.compareDates(event1.props.sortDate, event2.props.sortDate);
    })

    const addEventModal =
        <Modal2
            modalButton={<button><i>event</i><span>Add Event</span></button>}
            title="Add Event"
        >
            <Form id="new-event-modal-form" APIURL="/events/createEvent" additionalIds={{ modelId: model.id }} debug >
                <section className="modal-fields">
                    <Text id="newEventName" name="eventName" label="Event Name" value="" limit="64" isRequired />
                </section>
                <section className="modal-fields">
                    <Select id="newEventType" name="typeId" label="Event Type" value="" options={eventTypes} isRequired />
                </section>
                <section className="modal-fields">
                    <DateTime id="newEventStart" name="startDate" label="Event Start" value="" includeTime isRequired debug >
                        <DateTime id="newEventEnd" name="endDate" label="Event End" value="" includeTime isRequired />
                    </DateTime>
                </section>
                <section className="modal-buttons">
                    <button name="submit">Create Event</button>
                </section>
            </Form>
        </Modal2>
    
    const createSupportingEventModal =
        <Modal2
            modalButton={<button><i>add_box</i><span>Create Supporting Event</span></button>}
            title="Create Supporting Event"
        >
            <Form id="new-supporting-event-form" APIURL="/events/createEvent" additionalIds={{parentModelId: model.id}} >
                <section className="modal-fields">
                    <Text id="newModelName" name="modelName" label="Model Name" value="" limit="64" isRequired />
                </section>
                <section className="modal-fields">
                    <Select id="newEventType" name="typeId" label="Event Type" value="" options={eventTypes} isRequired />
                </section>
                <section className="modal-fields">
                    <DateTime id="newEventStart" name="startDate" label="Event Start" value="" includeTime isRequired debug >
                        <DateTime id="newEventEnd" name="endDate" label="Event End" value="" includeTime isRequired />
                    </DateTime>
                </section>
                <section className="modal-buttons">
                    <button name="submit">Create Event</button>
                </section>
            </Form>
        </Modal2>
        
    const setRecurrenceModal =
        <Modal2
            modalButton={<button><i>event</i><span>Set Recurrence</span></button>}
            title="Event Recurrence"
        >
            <Form id="event-recurrence" APIURL="/events/updateEventModelRecurrence" recordId={model.id} additionalIds={{ modStartDate: model.modStartDate, modEndDate: model.modEndDate }} debug>
                <section className="modal-fields" Vstyle={{width:"500px"}}>
                    <Number id="recurrence-interval" name="interval" label="Recurs Every" value={model.interval || 1} isRequired />
                    <Select id="recurrence-period" name="period" label="Period" value={model.period || "Week"} options={Period} isRequired Vstyle={{minWidth:"75%"}} >
                        <Collection id="recurrence-occurrence" name="occurrence" label="Occurrence" value={occurrenceValues} options={occurrences} filterKey="period" isRequired debug />
                    </Select>
                </section>
                <section className="modal-fields">
                    <DateTime id="recurrence-end-date" name="recEndDate" label="End Recurrence" value={model.recEndDate || minStartdate} min={minStartdate} isRequired />
                </section>
                <section className="modal-buttons">
                    <button name="submit">Save</button>
                </section>
            </Form>
        </Modal2>
    
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
                Vstyle={{width: "750px", margin: "0 20px 20px"}}
            >
                {
                    assignments.map((assignment, m) => {
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
    
    const initialAssignments = {}
    model.events.forEach(ev => {
        initialAssignments[ev.id] = {}
        Object.keys(schemasObj).forEach(schemaId => {
            initialAssignments[ev.id][schemaId] = ev.schemas.findIndex(schema => {
                return schema.schema.id === schemaId;
            }) >= 0;
        })
    })

    return (
        <div className="page-base">
            <div className="action-section">
                <ModelNav model={model} />
            </div>
            <div className="form-section">
                <div className="page-header">
                    <Form id="event-model-name-form" APIURL="/events/updateEventModel" recordId={model.id} auto >
                        <Text id="event-model-title" name="modelName" value={model.name} hero isRequired />
                    </Form>
                </div>
                <div className="page-details">
                    <article className="scroll">
                        <fieldset>
                            <legend>Basic Details</legend>
                            <Form id="event-details" APIURL="/events/updateEventModel" recordId={model.id} auto >
                                <section>
                                    <DateTime id="startDate" name="modStartDate" label="Start" value={model.modStartDate} includeTime isRequired>
                                        <DateTime id="endDate" name="modEndDate" label="End" value={model.modEndDate} includeTime isRequired/>
                                    </DateTime>
                                </section>
                                <Select id="eventType" name="eventType" label="Event Type" value={model.eventType.id} options={eventTypes} isRequired/>
                                <Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                            </Form>
                            
                            {/* <button onClick={() => fetch(`/api/events/deleteEventModelRecurrence?id=${model.id}`)} >Remove Recurrence</button> */}
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
                    </article>
                    <article className="scroll">
                        <fieldset>
                            <legend>Events</legend>
                            <section>
                                {addEventModal}
                                {createSupportingEventModal}
                                {setRecurrenceModal}
                            </section>
                            <article className="scroll">
                                { eventsList }
                            </article>
                        </fieldset>
                        <fieldset>
                            <legend>Schemas</legend>
                            <section>
                                {parentSchemas.length > 0 &&
                                    <Button name="test" label="Apply Parent Schemas" APIURL="/events/updateModelSchemas" payload={{eventModel: model.id, schemas: parentSchemas.map(ps => ps.id)}} debug />
                                }
                                <Modal2
                                    modalButton={<button><i>view_list</i><span>Manage Schemas</span></button>}
                                    title={`Manage ${model.name} Schemas`}
                                >
                                    <SchemaGrid
                                        model={model}
                                        schemasInModel={schemasObj}
                                        initialAssignments={initialAssignments}
                                        allSchemas={schemas}
                                    />
                                </Modal2>
                                {viewAssignedMembersModal}
                            </section>
                            <Form id="events-scheams" APIURL="/events/updateModelSchemas" additionalIds={{ eventModel: model.id }} auto >
                                <Collection id="all-events-schemas" name="schemas" label="All Event Schemas" value={modelSchemas} options={schemas} />
                            </Form>
                        </fieldset>
                    </article>
                </div>
            </div>
        </div>
    )
}

export default EventModelPage;