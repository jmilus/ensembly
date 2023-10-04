import 'server-only';

import { getManyEvents } from '@/api/calendar/route';

import Calendar from 'components/Calendar';

import CALENDAR from 'utils/calendarUtils';

const EventsPage = async (context) => {
    console.log("EventsPage:", {context})
    const events = await getManyEvents({ ...CALENDAR.getCalendarView(context.params.cal) });

    const urlDate = context.params.cal.split("-")
    const focusDay = new Date(urlDate[0], parseInt(urlDate[1]) - 1, urlDate[2]);

    return (
        <div id="page">
            <article>
                <Calendar firstDay={focusDay} events={events} />
            </article>
        </div>
    )
}

export default EventsPage;