'use client';

import Link from 'next/link';

import CALENDAR from '../utils/calendarUtils';
import { CAL } from '../utils/constants';

const NOW = new Date(Date.now());
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

export const getCalendarView = (input, totalDays = 34) => {
    const d = input ? new Date(input) : new Date();

    const startDate = new Date(d.setDate(d.getDate() - d.getDay()));
    const endDate = new Date(d.setDate(d.getDate() + totalDays));

    return { startDate, endDate, totalDays };
}

export const EventNode = ({ event, color, caption, showDate, inheritedStyle }) => {
    const isPast = new Date(event.eventStartDate) < TODAY;
    const eventTypeColor = isPast ? "lightgrey" : color;
    
    return (
        <Link href={`/calendar/event/${event.id}`}>
            <div className="event-node" style={{...inheritedStyle, ["--node-color"]: eventTypeColor}}>
                <span>{caption}</span>
                <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(event.eventStartDate)}</span>
            </div>
        </Link>
    )
}

const CalDay = ({ day, events = [], inMonth }) => {
    const isToday = day.value.toLocaleDateString() === TODAY.toLocaleDateString();
    const isPast = day.value < TODAY;

    const dayURL = CALENDAR.getDashedValue(CALENDAR.localizeDate(day.value), true)
    return (
        <object className={`cal-day ${inMonth ? "current-month" : ""} ${isToday ? "today" : ""} ${isPast ? "past" : ""}`}>
            <div className="cal-day-header">
                <span>{day.value.getDate() === 1 ? CAL.month.long[day.value.getMonth()] : ""}</span>
                <Link href={`/calendar/day/${dayURL}`}>
                    <div className="day-button" style={isToday ? {color: "var(--text1)"} : null}>
                        {day.value.getDate()}
                    </div>
                </Link>
            </div>
            <div className="cal-events">
                {
                    events.map((ev, i) => {
                        return <EventNode key={i} color={ev.model.type.color} caption={ev.name || ev.model.name} event={ev} />
                    })
                }
            </div>
        </object>
    )
}

const Calendar = ({ firstDay, events, viewDays = 35 }) => {
    console.log(events)
    let { startDate, endDate, totalDays } = getCalendarView(firstDay);

    const thisMonth = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 13).getMonth();

    const displayDays = {};
    
    for (var x = 0;
        x < viewDays;
        x++) {
        displayDays[CALENDAR.getDashedValue(startDate, true)] = {value: new Date(startDate), events: []}
        startDate.setDate(startDate.getDate() + 1);
    }

    events.forEach(event => {
        const dayCount = CALENDAR.compareDates(event.eventStartDate, event.eventEndDate);
        // console.log(event.eventStartDate, event.eventEndDate, dayCount)
        let cursorDay = new Date(event.eventStartDate);

        for (var d = 0; d <= dayCount; d++) {
            displayDays[CALENDAR.getDashedValue(cursorDay, true)]?.events.push(event)
            cursorDay.setDate(cursorDay.getDate() + 1);
        }
    })

    return (
        <>
            <div className="weekday-headers-row">
                {
                    CAL.weekday.long.map((wd, d) => {
                        return <div key={d} className="weekday-header">{wd}</div>
                    })
                }
            </div>
            <div className="grid-calendar">
                {
                    Object.values(displayDays).map((day, i) => {
                        return <CalDay key={i} day={day} events={day.events} inMonth={day.value.getMonth() === thisMonth} />
                    })
                }
            </div>
        </>
    )
}

export default Calendar;