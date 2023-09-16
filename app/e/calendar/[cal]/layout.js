import 'server-only';

import Link from 'next/link';

import { CAL } from 'utils/constants';
import CALENDAR from 'utils/calendarUtils';

import ModalButton from 'components/ModalButton';
import { Form, Text, Select, DateTime } from 'components/Vcontrols';
import SubNav from 'components/SubNav';

import 'styles/calendar.css'
import { getAllEventTypes } from '@/api/calendar/event/types/route';

const EventsPage = async (context) => {
    console.log("EventsPage:", { context })
    
    const eventTypes = await getAllEventTypes();

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

    const navButtons = [
        <section key="calendar-navigator" className="calendar-control button-chain row" >
            <Link href={`/e/calendar/${changeFocus(-1, "month")}`}><button className="fit"><i>keyboard_double_arrow_left</i></button></Link>
            <Link href={`/e/calendar/${changeFocus(-7)}`}><button className="fit"><i>navigate_before</i></button></Link>
            <Link href={`/e/calendar`}><button className="fit"><i>last_page</i>Today<i>first_page</i></button></Link>
            <Link href={`/e/calendar/${changeFocus(7)}`}><button className="fit"><i>navigate_next</i></button></Link>
            <Link href={`/e/calendar/${changeFocus(1, "month")}`}><button className="fit"><i>keyboard_double_arrow_right</i></button></Link>
        </section>,
        <ModalButton
            key="modal-button-new-event"
            title="Create New Event"
            modalButton={<><i>event</i><span>New Event</span></>}
            buttonClass="fit"
        >
            <Form id="new-event-modal-form" METHOD="POST" APIURL="/api/calendar/event/model" followPath="/e/calendar/event/model/$slug$" debug>
                <section className="modal-fields">
                    <Text id="newEventName" name="modelName" label="Event Name" value="" limit="64" isRequired/>
                </section>
                <section className="modal-fields">
                    <Select id="newEventType" name="type" label="Event Type" value="" options={eventTypes} isRequired />
                </section>
                <section className="modal-fields">
                    <DateTime id="newEventStart" name="modelStartDate" label="Event Start" value="" includeTime isRequired debug>
                        <DateTime id="newEventEnd" name="modelEndDate" label="Event End" value="" includeTime isRequired/>
                    </DateTime>
                </section>
            </Form>
            <section className="modal-buttons" form="new-event-modal-form">
                <button name="submit" form="new-event-modal-form">Create Event</button>
            </section>
        </ModalButton>
        
    ]

    return (
        <div className="page-base">
            <div className="action-section">
                <SubNav caption={monthName} root="calendar" buttons={navButtons} />
            </div>
            <div className="form-section">
                <section>
                    
                </section>
                {context.children}
            </div>
        </div>
    )
}

export default EventsPage;