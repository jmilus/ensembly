import 'server-only';

import CalendarDay from './CalendarDay';

import { fetchManyEvents } from '../../../../pages/api/events/getManyEvents';

const CalendarDayEvents = async (context) => {
    console.log("params date:", context.params.date)
    const dayEnd = new Date(context.params.date)

    const offset = new Date().getTimezoneOffset() / 60
    // const day = new Date(newDay.setHours(newDay.getHours() + (newDay.getTimezoneOffset() / 60)))
    const s = new Date(context.params.date);
    const e = new Date(dayEnd.setDate(dayEnd.getDate() + 1))
    const oneDay = {
        startDate: s.setHours(s.getHours() + offset),
        endDate: e.setHours(e.getHours() + offset)
    }

    const events = await fetchManyEvents(oneDay);

    return <CalendarDay {...{events, calendarDay: s}} />
}

export default CalendarDayEvents;