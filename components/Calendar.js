import Link from 'next/link';

import CALENDAR from '../utils/calendarUtils';
import { CAL } from '../utils/constants';

const NOW = new Date(Date.now());
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

export const EventNode = ({ event, showDate, inheritedStyle }) => {
    const typeColor = JSON.parse(event.model.eventType.color)
    const isPast = new Date(event.startDate) < TODAY;
    const eventTypeColor = isPast ? "lightgrey" : `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;

    return (
        <Link href={`/calendar/event/${event.id}`}>
            <div className="event-node" style={{...inheritedStyle, ["--node-color"]: eventTypeColor}}>
                <span>{event.model.name}</span>
                <span style={{minWidth: "5em", textAlign: "right"}}>{CALENDAR.getTime(event.startDate)}</span>
            </div>
        </Link>
    )
}

const CalDay = ({ day, events = [], inMonth }) => {
    const isToday = day.value.toLocaleDateString() === TODAY.toLocaleDateString();
    const isPast = day.value < TODAY;

    const dayURL = CALENDAR.getDashedValue(CALENDAR.localizeDate(day.value))
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
                        return <EventNode key={i}  event={ev} />
                    })
                }
            </div>
        </object>
    )
}

const Calendar = ({ firstDay, events, viewDays = 34 }) => {
    let d = new Date(firstDay);

    const thisMonth = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 13).getMonth();

    const displayDays = {};
    
    for (var x = 0; x <= viewDays; x++) {
        const day = new Date(d);
        displayDays[day.toLocaleDateString()] = {value: day, events: []}
        d.setDate(d.getDate() + 1);
    }

    // console.log({ displayDays });

    events.forEach(event => {
        const dayCount = CALENDAR.compareDates(event.startDate, event.endDate);
        console.log(event.startDate, event.endDate, dayCount)
        let cursorDay = new Date(event.startDate);

        for (var d = 0; d <= dayCount; d++) {
            displayDays[cursorDay.toLocaleDateString()]?.events.push(event)
            cursorDay.setDate(cursorDay.getDate() + 1);
        }
    })

    return (
        <div className="grid-calendar">
            {
                Object.values(displayDays).map((day, i) => {
                    return <CalDay key={i} day={day} events={day.events} inMonth={day.value.getMonth() === thisMonth} />
                })
            }
        </div>
    )
}

export default Calendar;