import 'server-only';

import { getManyEvents } from '@/api/calendar/route';

import Calendar from 'components/Calendar';

import CALENDAR from 'utils/calendarUtils';

const EventsPage = async (context) => {
    console.log("EventsPage:", { context })
    const { startDate, endDate, totalDays } = CALENDAR.getCalendarView(context.params.cal)
    const events = await getManyEvents({ startDate, endDate });

    return (
        <div id="page">
            <article>
                <Calendar startDate={CALENDAR.getDashedValue(startDate, true)} endDate={endDate} events={events} />
            </article>
        </div>
    )
}

export default EventsPage;