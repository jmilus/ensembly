import Link from 'next/link';

import SubNav from 'components/SubNav';

import { getOneEvent } from "@/api/calendar/event/[id]/route"

export default async function EventLayout(props) {
    const event = await getOneEvent(props.params.id)

    const navButtons = [
        <Link key="x" href={`/e/calendar/event/model/${event.model.id}`} >
            <button className="fit" style={{flex:1}}>
                <i>dynamic_feed</i><span>Event Model</span>
            </button>
        </Link>
    ]

    const navNodes = [
        { caption: "Model", route: `/e/event/model/${event.model.id}` }
    ]

    return (
        <div id="page-base">
            <div id="page-header">
                <SubNav root="calendar" buttons={navButtons} />
            </div>
            <div id="page-frame">
                {props.children}
            </div>
        </div>
    )
}