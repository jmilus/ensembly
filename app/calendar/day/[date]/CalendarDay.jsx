'use client'

import { useRouter } from 'next/navigation';

import {Text} from '../../../../components/Vcontrols/';
import { EventNode } from '../../../../components/Calendar';

import basePageStyles from '../../../../styles/basePage.module.css';

const DayProfile = (initialProps) => {
    console.log(initialProps);
    const { events, calendarDay } = initialProps;

    const router = useRouter();
    
    const day = new Date(calendarDay);
    
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.actionSection}>
                <button className="icon-and-label" onClick={() => router.push("/events")}><i>arrow_back</i>Back to Calendar</button>
            </div>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <Text id="name" field="name" value={day.toLocaleDateString()} hero isRequired limit="64" readonly/>
                </div>
                <div className={basePageStyles.pageDetails}>
                    {
                        events.map((event, e) => {
                            return <EventNode key={e} event={event} inheritedStyle={{ fontSize: "1em" }} />
                        })
                    }
                    
                </div>
            </div>
        </div>
    )
}

export default DayProfile;