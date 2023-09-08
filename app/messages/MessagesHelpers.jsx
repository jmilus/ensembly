'use client'

import { useRouter } from 'next/navigation';

export const BroadcastBox = ({info}) => {
    const { id, subject, status, status_date } = info;
    const router = useRouter();
    return (
        <div id={id} className={`card-container broadcast-list-button${status === "DRAFT" ? " draft" : ""}`} onClick={() => router.push(`/messages/broadcasts/${id}`)}>
            <div className="card-header">
                <i>{status === "DRAFT" ? "edit_document" : "send"}</i>
                <div className="broadcast-status">
                    <span className="subject">{subject}</span>
                    <span className="date">{status === "DRAFT" ? "Edited: " : "Sent: "}{new Date(status_date).toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
