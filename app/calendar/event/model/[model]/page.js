import 'server-only'

import Link from 'next/link';

import { getOneEventModel } from '../../../../api/calendar/event/model/[model]/route';
import { getManyEventModels } from '../../../../api/calendar/event/model/route';
import { getAllEventTypes } from '../../../../api/calendar/event/types/route';
import { updateOneEventModel } from '../../../../api/calendar/event/model/[model]/route';
import { getManyLineups } from '../../../../api/ensembles/[id]/lineup/route';
// import { fetchModelSchemas } from '../../../../api/ensembles/getModelSchemas';
// import { fetchManySchemaAssignments } from '../../../../api/ensembles/getManySchemaAssignees';

import { Form, Text, DateTime, Select, Collection, Number, Button } from '../../../../../components/Vcontrols';
import { EventNode } from '../../../../../components/Calendar';
import MemberCard from '../../../../../components/MemberCard';
import FilterContainer from '../../../../../components/FilterContainer'
import ModalButton from '../../../../../components/ModalButton';

import { ClientConsole } from '../../../../../components/ClientConsole';

import { SchemaGrid } from '../../../CalendarHelpers';

import CALENDAR from '../../../../../utils/calendarUtils';
import { CAL } from '../../../../../utils/constants';

export const ModelNode = ({ model, inheritedStyle }) => {

    return (
        <Link href={`/calendar/event/model/${model.id}`}>
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
    
    childModels.forEach((cmodel, m) => {
        eventNodes.push( <ModelNode key={`c-${m}`} model={cmodel} showDate sortDate={cmodel.modelStartDate} /> )
    })
    
    eventNodes.sort((event1, event2) => {
        return -CALENDAR.compareDates(event1.props.sortDate, event2.props.sortDate);
    })


    return (
        <>
            <div className="page-header">
                <Form id="event-model-name-form" auto >
                    <Text id="event-model-title" name="name" value={model.name} hero isRequired />
                </Form>
            </div>
            <div className="page-details">
                <article className="scroll">
                    <fieldset>
                        <legend>Basic Details</legend>
                        <Form id="event-details" auto >
                            <section>
                                <DateTime id="startDate" name="modelStartDate" label="Start" value={model.modelStartDate} includeTime isRequired>
                                    <DateTime id="endDate" name="modelEndDate" label="End" value={model.modelEndDate} includeTime isRequired/>
                                </DateTime>
                            </section>
                            <Select id="eventType" name="type" label="Event Type" value={model.type.id} options={eventTypes} isRequired/>
                            <Text id="eventDetails" name="details" label="Details" value={model.details} limit="1000" />
                        </Form>
                        
                        {/* <button onClick={() => fetch(`/api/events/deleteEventModelRecurrence?id=${model.id}`)} >Remove Recurrence</button> */}
                    </fieldset>
                    <fieldset>
                        <legend>Event Address</legend>
                        <Form id="event-location" APIURL="/general/updateAddress" auxData={{ modelId: model.id }} auto>
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
                        <section className="button-tray">
                            <Link href={`/calendar/event/model/${model.id}/$add-event`}><button className="fit"><i>event</i><span>Add Event</span></button></Link>
                            <Link href={`/calendar/event/model/${model.id}/$create-supporting-event`}><button className="fit"><i>add_box</i><span>Create Supporting Event</span></button></Link>
                            <Link href={`/calendar/event/model/${model.id}/$set-recurrence`}><button className="fit"><i>event</i><span>Set Recurrence</span></button></Link>
                        </section>
                        <article className="scroll" style={{padding:"5px"}}>
                            { eventNodes }
                        </article>
                    </fieldset>
                    <fieldset>
                        <legend>Lineups</legend>
                        <section className="button-tray">
                            {parentLineups.length > 0 &&
                                <Button label="Apply Parent Lineups" buttonClass="fit" APIURL="/api/calendar/event" METHOD="PUT" payload={{ events: model.events.map(event => event.id), lineups: parentLineups }} />
                            }
                            <Link href={`/calendar/event/model/${model.id}/$manage-lineups`}><button className="fit"><i>view_list</i><span>Manage Lineups</span></button></Link>
                            <Link href={`/calendar/event/model/${model.id}/$view-assigned-members`}><button className="fit"><i>groups</i><span>View Assigned Members</span></button></Link>
                        </section>
                        <Form id="events-lineups" APIURL="/api/calendar/event" METHOD="PUT" auxData={{route: "all", initialLineups: Object.keys(modelLineups), events: model.events.map(ev => ev.id)}} auto>
                            <Collection id="all-events-lineups" name="lineups" label="All Event Lineups" value={modelLineups} options={lineups} />
                        </Form>
                    </fieldset>
                </article>
            </div>
        </>
    )
}

export default EventModelPage;