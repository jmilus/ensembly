import Link from 'next/link';

import { getOneEvent } from "../../../api/calendar/event/[id]/route"

export default async function EventLayout(props) {
    const event = await getOneEvent(props.params.id)

    return (
        <div className="page-base">
            <div className="action-section">
                <article style={{ padding: "10px" }}>
                    <Link href="/calendar"><i>arrow_back</i>Calendar</Link>
                    <h1>Event Details</h1>
                    <article className="button-chain column" >
                        <Link href={`/calendar/event/model/${event.model.id}`} >
                            <button className="fat" style={{flex:1}}>
                                <i>dynamic_feed</i><span>Event Model</span>
                            </button>
                        </Link>
                    </article>
                </article>
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}