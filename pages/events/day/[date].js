import { fetchManyEvents } from '../../api/events/getManyEvents';
import useLoader from '../../../hooks/useLoader';

import Link from 'next/link';

import VForm from '../../../components/VForm';
import V from '../../../components/ControlMaster';
import { EventNode } from '../../../components/Calendar';

import basePageStyles from '../../../styles/basePage.module.css';

export async function getServerSideProps(context) {
    const dayEnd = new Date(context.params.date)
    const oneDay = {
        startDate: new Date(context.params.date),
        endDate: dayEnd.setDate(dayEnd.getDate() + 1)
    }
    console.log("this is oneDay:", oneDay, "with params", context.params)

    const events = await fetchManyEvents(oneDay);

    return {
        props: {
            events,
            calendarDay: context.params.date
        }
    }
}

const DayProfile = (initialProps) => {
    console.log(initialProps);
    const { events, calendarDay } = initialProps;
    
    const day = new Date(calendarDay);
    
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <V.Text id="name" field="name" value={day.toLocaleDateString()} hero isRequired limit="64" readonly/>
                </div>
                <div className={basePageStyles.pageDetails}>
                    {
                        events.map((event, e) => {
                            return <EventNode key={e} event={event} inheritedStyle={{ fontSize: "1em" }} />
                        })
                    }
                    
                </div>
            </div>
            <div className={basePageStyles.actionSection}>
                <Link href="/events"><button className="icon-and-label"><i>arrow_back</i>Back to Calendar</button></Link>
            </div>
        </div>
    )
}

export default DayProfile;