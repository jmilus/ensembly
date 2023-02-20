import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import useLoader from '../../hooks/useLoader';

import {fetchManyEvents} from '../api/events/getManyEvents';
import {fetchManyEventTypes} from '../api/events/getManyEventTypes';
import {fetchManyEnsembles} from '../api/ensembles/getManyEnsembles';

import Meta from '../../components/Meta';
import Calendar from '../../components/Calendar';
import V from '../../components/Vcontrols/VerdantControl';

import { CAL } from '../../utils/constants';
import CALENDAR from '../../utils/calendarUtils';
import { GlobalContext } from "../_app";

import basePageStyles from '../../styles/basePage.module.css';

const TODAY = new Date();

export async function getServerSideProps() {
    const events = await fetchManyEvents({ ...CALENDAR.getCalendarView(), bufferDays: 35 });
    const eventTypes = await fetchManyEventTypes();
    const ensembles = await fetchManyEnsembles();

    return {
        props: {
            events,
            eventTypes,
            ensembles
        }
    }
}

export default function EventsPage(initialProps) {
    const { dispatch } = useContext(GlobalContext);
    const [events, setEvents] = useState(initialProps.events);
    const [searchString, setSearchString] = useState("");
    const initialFocus = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 7);

    const [focusDay, setFocusDay] = useState(initialFocus);

    const router = useRouter();

    const { startDate, endDate } = CALENDAR.getCalendarView(focusDay);

    useLoader("all-events", setEvents, `/api/events/getManyEvents`, { startDate, endDate, bufferDays: 35 });

    console.log("loaded:", events, initialProps)

    useEffect(() => {
        (async function () {
            const x = fetch('/api/events/getManyEvents', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ startDate, endDate, bufferDays: 35 })
            })
                .then(res => res.json())
                .then(events => setEvents(events))
                .catch((err, message) => {
                    console.error('failed to fetch events for the viewing period');
                    dispatch({
                        type: "modal",
                        payload: {
                            type: "error",
                            errCode: err.code
                        }
                    })
                    return err;
            })
        })()
    }, [focusDay])

    const newEventModal = () => {
        const submitModal = (newRecord) => {
            console.log("returned event record:", newRecord);
            dispatch({
                type: "modal",
                payload: {
                    type: "hide"
                }
            })
            router.push(`/events/eventmodel/${newRecord.model.id}`)
        }

        const modalBody = 
            <V.Form id="new-event-modal-form" APIURL="/events/createEvent" followUp={submitModal} debug>
                <section className="modal-fields">
                    <V.Text id="newEventName" name="name" label="Event Name" value="" limit="64" isRequired/>
                </section>
                <section className="modal-fields">
                    <V.Select id="newEventEnsemble" name="ensembles" label="Ensemble" value="" options={initialProps.ensembles} isRequired />
                    <V.Select id="newEventType" name="typeId" label="Event Type" value="" options={initialProps.eventTypes} isRequired />
                </section>
                <section className="modal-fields">
                    <V.Date id="newEventStart" name="startDate" label="Event Start" value="" includeTime isRequired>
                        <V.Date id="newEventEnd" name="endDate" label="Event End" value="" includeTime isRequired/>
                    </V.Date>
                </section>
                <section className="modal-buttons">
                    <button name="submit">Create Event</button>
                    <button >Cancel</button>
                </section>
            </V.Form>

        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Create New Event",
                    body: modalBody
                }
            }
        })
    }

    // const filteredEvents = events.filter(event => {
    //     return event.model.name.includes(searchString);
    // })

    const changeFocus = (change, mode) => {
        let newFocusDay = new Date(focusDay);
        let changeDays = change;
        switch (mode) {
            case "month":
                newFocusDay.setMonth(newFocusDay.getMonth() + change);
                newFocusDay.setDate(1);
                break;
            case "week":
                changeDays = changeDays * 7;
                
            default:
                newFocusDay.setDate(newFocusDay.getDate() + changeDays)
                break;
        }
        setFocusDay(new Date(newFocusDay))
    }

    const monthName = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 13).getMonth();

    return (
        <>
            <Meta title={"Ensembly | Events"} />
            <div className={basePageStyles.pageBase}>
                <div className={basePageStyles.formSection}>
                    <div className={basePageStyles.pageHeader}>
                        <h1>{CAL.month.long[monthName]}</h1>
                    </div>
                    <div className={basePageStyles.pageDetails}>
                        <article>
                            <div className="calendar-month"></div>
                            <section className="calendar-control">
                                <button onClick={() => changeFocus(-1, "month")}>Prev Month</button>
                                <button onClick={() => changeFocus(-7)}>Prev Week</button>
                                <button onClick={() => setFocusDay(initialFocus)}>Today</button>
                                <button onClick={() => changeFocus(7)}>Next Week</button>
                                <button onClick={() => changeFocus(1, "month")}>Next Month</button>
                            </section>
                            <Calendar firstDay={startDate} events={events} />
                        </article>
                    </div>
                </div>
                <div className={basePageStyles.actionSection}>
                    <input className="uncontrolled-text" type="text" placeholder="Search..." onChange={(e) => setSearchString(e.target.value)} />
                    <button className="icon-and-label" onClick={newEventModal}><i>event</i>New Event</button>
                </div>
            </div>
        </>
    )
}