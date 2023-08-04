import 'server-only';

import Link from 'next/link';

import { CAL } from '../../../utils/constants';
import CALENDAR from '../../../utils/calendarUtils';

import '../../../styles/calendar.css'

const EventsPage = async (context) => {
    console.log("EventsPage:", {context})

    const urlDate = context.params.cal.split("-")
    const focusDay = new Date(urlDate[0], parseInt(urlDate[1]) - 1, urlDate[2]);

    const startMonthLastDay = CALENDAR.getLastOfMonth(focusDay);
    const startMonthRemaining = CALENDAR.compareDates(focusDay, startMonthLastDay);

    const startMonth = startMonthRemaining > 6 ? CAL.month.long[focusDay.getMonth()] : ""
    const nextMonth = startMonthRemaining < 22 ? CAL.month.long[focusDay.getMonth() + 1] : ""

    const monthName = startMonth + (startMonth && nextMonth ? " to " : "") + nextMonth;

    const changeFocus = (change, mode) => {
        let newFocusDay = new Date(focusDay);
        // console.log({ newFocusDay })
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
        // console.log("sending newFocusDay as", newFocusDay)
        return CALENDAR.getDashedValue(newFocusDay, true);
    }


    return (
        <div className="page-base">
            <div className="action-section">
                <article style={{ padding: "10px" }}>
                    <h1>{monthName}</h1>
                    <section className="calendar-control button-chain row" style={{justifyContent: "space-between"}}>
                        <Link href={`/calendar/${changeFocus(-1, "month")}`}><button><i>keyboard_double_arrow_left</i></button></Link>
                        <Link href={`/calendar/${changeFocus(-7)}`}><button><i>navigate_before</i></button></Link>
                        <Link href={`/calendar`}><button><i>last_page</i>Today<i>first_page</i></button></Link>
                        <Link href={`/calendar/${changeFocus(7)}`}><button><i>navigate_next</i></button></Link>
                        <Link href={`/calendar/${changeFocus(1, "month")}`}><button><i>keyboard_double_arrow_right</i></button></Link>
                    </section>
                    <Link href={`/calendar/${context.params.cal}/new-event`}><button className="fat"><i>event</i><span>New Event</span></button></Link>
                </article>
                
            </div>
            <div className="form-section">
                {context.children}
                {context.modal}
            </div>
        </div>
    )
}

export default EventsPage;