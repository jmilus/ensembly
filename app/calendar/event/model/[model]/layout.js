import 'server-only';

import Link from 'next/link';

export default async function ModelLayout(props) {

    return (
        <div className="page-base">
            <div className="action-section">
            <article style={{ padding: "10px" }}>
                <Link href="/calendar"><i>arrow_back</i>Calendar</Link>
                <h1>Event Model</h1>
            </article>
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}