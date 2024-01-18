import { getManyEvents } from '@/api/calendar/route';
import { EventNode } from 'components/Calendar';
import 'server-only';



export default async function EnsembleGeneralPage({params}) {
    const events = await getManyEvents({startDate:'2023-10-01', endDate:'2023-12-31', ensemble: params.id})
    // console.log({ events })
    return (
        <>
            <div id="record-header" className="hero-text">Schedule</div>
            <div id="page-grid">
                {
                    events.map((ev, i) => {
                        return <EventNode key={i} color={ev.model.type.color} caption={ev.name || ev.model.name} event={ev} />
                    })
                }
            </div>
        </>
    )
}