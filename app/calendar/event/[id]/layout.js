import Link from 'next/link';

import SubNav from '../../../../components/SubNav';

import { getOneEvent } from "../../../api/calendar/event/[id]/route"

export default async function EventLayout(props) {
    const event = await getOneEvent(props.params.id)

    const navButtons = [
        <Link key="x" href={`/calendar/event/model/${event.model.id}`} >
            <button className="fit" style={{flex:1}}>
                <i>dynamic_feed</i><span>Event Model</span>
            </button>
        </Link>
    ]

    const navNodes = [
        { caption: "Model", route: `/event/model/${event.model.id}` }
    ]

    return (
        <div className="page-base">
            <div className="action-section">
                <SubNav root="calendar" buttons={navButtons} />
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}