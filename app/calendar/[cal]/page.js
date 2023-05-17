import 'server-only';

import Link from 'next/link';

import { fetchManyEvents } from '../../../pages/api/events/getManyEvents';
import { fetchManyEventTypes } from '../../../pages/api/events/getManyEventTypes';
import { fetchManyEnsembles } from '../../../pages/api/ensembles/getManyEnsembles';

import Calendar from '../../../components/Calendar';

import { CAL } from '../../../utils/constants';
import CALENDAR from '../../../utils/calendarUtils';
import { CalendarNav } from '../CalendarHelpers';

const EventsPage = async (context) => {
    
    const events = await fetchManyEvents({ ...CALENDAR.getCalendarView(), bufferDays: 35 });
    const eventTypes = await fetchManyEventTypes();
    const ensembles = await fetchManyEnsembles();

    const urlDate = context.params.cal.split("-")
    console.log({urlDate})
    const focusDay = new Date(urlDate[0], parseInt(urlDate[1]) - 1, urlDate[2]);
    console.log({ focusDay })

    const startMonthLastDay = CALENDAR.getLastOfMonth(focusDay);
    const startMonthRemaining = CALENDAR.compareDates(focusDay, startMonthLastDay);

    const startMonth = startMonthRemaining > 6 ? CAL.month.long[focusDay.getMonth()] : ""
    const nextMonth = startMonthRemaining < 22 ? CAL.month.long[focusDay.getMonth() + 1] : ""

    const monthName = startMonth + (startMonth && nextMonth ? " to " : "") + nextMonth;

    const changeFocus = (change, mode) => {
        let newFocusDay = new Date(focusDay);
        console.log({ newFocusDay })
        let changeDays = change;
        switch (mode) {
            case "month":
                newFocusDay = new Date(newFocusDay.setDate(newFocusDay.getDate() + 6));
                newFocusDay = new Date(newFocusDay.setMonth(newFocusDay.getMonth() + change));
                newFocusDay = new Date(newFocusDay.setDate(1));
                break;
            case "week":
                changeDays = changeDays * 7;
                
            default:
                newFocusDay = new Date(newFocusDay.setDate(newFocusDay.getDate() + changeDays))
                break;
        }
        console.log("sending newFocusDay as", newFocusDay)
        return CALENDAR.getDashedValue(newFocusDay).slice(0, 10);
    }

    return (
        <div className="page-base">
            <div className="action-section">
                <CalendarNav ensembles={ensembles} eventTypes={eventTypes} />
            </div>
            <div className="form-section">
                <div className="page-header">
                    <h1>{monthName}</h1>
                </div>
                <div className="page-details">
                    <article>
                        <section className="calendar-control" style={{justifyContent: "space-between"}}>
                            <Link href={`/calendar/${changeFocus(-1, "month")}`}><button><i>keyboard_double_arrow_left</i><span>Prev Month</span></button></Link>
                            <Link href={`/calendar/${changeFocus(-7)}`}><button><i>navigate_before</i><span>Prev Week</span></button></Link>
                            <Link href={`/calendar`}><button><i>last_page</i>Today<i>first_page</i></button></Link>
                            <Link href={`/calendar/${changeFocus(7)}`}><button><span>Next Week</span><i>navigate_next</i></button></Link>
                            <Link href={`/calendar/${changeFocus(1, "month")}`}><button><span>Next Month</span><i>keyboard_double_arrow_right</i></button></Link>
                        </section>
                        <Calendar firstDay={focusDay} events={events} />
                    </article>
                </div>
            </div>
        </div>
    )
}

export default EventsPage;