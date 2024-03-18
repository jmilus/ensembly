import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';
import { extractFields } from 'utils';
import { slateToHtml } from 'utils/slateToHtml';
import { POSTMARK_TOKEN } from 'config';
import { getOneBroadcast, updateOneBroadcast } from '../route';

export const sendBroadcast = async (props) => {
    // const { id, to_address, cc_address, bcc_address, subject, htmlBody, textBody, tag } = props
    console.log({ props })
    // console.log(POSTMARK_TOKEN);

    const broadcast = await getOneBroadcast(props.id)

    console.log({ broadcast });

    const thisHtml = slateToHtml(broadcast.body);

    const sentResponse = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Postmark-Server-Token': POSTMARK_TOKEN
            },
            body: JSON.stringify({
                'From': "hello@ensembly.app",
                'To': broadcast.to_address.map(to => to).join(","),
                'cc': broadcast.cc_address.map(cc => cc).join(","),
                'bcc': broadcast.bcc_address.map(bcc => bcc).join(","),
                'Subject': broadcast.subject,
                'HtmlBody': thisHtml,
                'TextBody': "",
                'Tag': "BROADCAST",
                'MessageStream':"ensembly-announcements"
            })
        })
            .then(response => response.json())
            .then(res => res)
            .catch((err, message) => {
                console.error("failed to send broadcast", err, message);
                return err;
            })
    
    let sendResult
    if (sentResponse.Message === "OK") {
        sendResult = await updateOneBroadcast({id: broadcast.id, status: "PUBLISHED"})
    } else {
        console.log({sentResponse})
    }
    

    return sentResponse;
}

export async function POST(request, { params }) {
    // const req = await request.json();
    console.log("send email?", params)
    const res = await sendBroadcast({id: params.id })
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res);
}