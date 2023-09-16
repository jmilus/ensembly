import 'server-only';

import { redirect } from 'next/navigation'

import CALENDAR from 'utils/calendarUtils';

export default async function CalendarRedirect() {
    const redirectDate = CALENDAR.getDashedValue(new Date()).slice(0, 10);
    redirect(`/calendar/${redirectDate}`);
}