'use client';

import Link from 'next/link';

import CALENDAR from 'utils/calendarUtils';
import { CAL } from 'utils/constants';

const NOW = new Date(Date.now());
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

export const EventNode = ({ event, color, caption, showDate, style }) => {
    const isPast = new Date(event.eventStartDate) < TODAY;
    const eventTypeColor = isPast ? "lightgrey" : `hsl(${color})`;
    
    return (
        <Link href={`/e/calendar/event/${event.id}`} className="event-node" style={{...style, ["--node-color"]: eventTypeColor}}>
            <span>{caption}</span>
            <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(event.eventStartDate)}</span>
        </Link>
    )
}

const CalDay = ({ day, inMonth }) => {
    const { value, events } = day;
    // console.log({ day })
    const isToday = value.toLocaleDateString() === TODAY.toLocaleDateString();
    const isPast = value < TODAY;
    const isWeekend = value.getDay() === 0 || value.getDay() === 6 ? true : false;

    const dayURL = CALENDAR.getDashedValue(CALENDAR.localizeDate(value), true)
    return (
        <object className={`cal-day${inMonth ? " current-month" : ""}${isToday ? " today" : ""}${isPast ? " past" : ""}${isWeekend ? " weekend" : ""}`}>
            <div className="cal-day-header">
                <span>{value.getDate() === 1 ? CAL.month.long[value.getMonth()] : ""}</span>
                <Link href={`/e/calendar/day/${dayURL}`}>
                    <div className="day-button" style={isToday ? {color: "var(--text1)"} : null}>
                        {value.getDate()}
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

const Calendar = ({ startDate, endDate, events, viewDays = 35 }) => {
    console.log("Calendar start date:", { startDate })

    const thisMonth = 10;

    const displayDays = {};
    
    const calendarDay = CALENDAR.createNowDate(startDate)
    console.log({calendarDay})
    for (var x = 0;
        x < viewDays;
        x++) {
        console.log({calendarDay})
        displayDays[CALENDAR.getDashedValue(calendarDay, true)] = {value: new Date(calendarDay), events: []}
        calendarDay.setDate(calendarDay.getDate() + 1);
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
                    Object.values(displayDays).map((day, d) => {
                        return <CalDay key={d} day={day} inMonth={day.value.getMonth() === thisMonth} />
                    })
                }
            </div>
        </>
    )
}

export default Calendar;