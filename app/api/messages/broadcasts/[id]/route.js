import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { slateToHtml } from '../../../../../utils/slateToHtml';

export const getOneBroadcast = async (id) => {
    const supabase = createServerComponentClient({ cookies });

    const { data: broadcast, error } = await supabase
        .from("Broadcast")
        .select()
        .eq('id', id)
    
    if (error) {
        console.error("fetch one Broadcast error:", error);
        return new Error(error);
    }

    return broadcast;
}

export const updateOneBroadcast = async (props) => {
    console.log("save broadcast props:", props);
    const supabase = createServerComponentClient({ cookies });

    const { id, subject, body, to_address, cc_address, bcc_address } = props;

    const { data: broadcast, error } = await supabase
        .from("Broadcast")
        .upsert({
            id: id === "new" ? undefined : id,
            subject,
            body,
            to_address,
            cc_address,
            bcc_address
        })
    
    if (error) {
        console.error("save one Broadcast error:", error);
        return new Error(error);
    }

    return broadcast;
}

export const sendBroadcast = async (props) => {
    // const { id, to_address, cc_address, bcc_address, subject, htmlBody, textBody, tag } = props
    // console.log({ props })
    console.log(props)
    console.log(process.env.POSTMARK_TOKEN);

    const fetchedBroadcast = await getOneBroadcast(props.id)
    const broadcast = fetchedBroadcast[0];

    console.log({ broadcast });

    const thisHtml = slateToHtml(broadcast.body);

    const pmResponse = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Postmark-Server-Token': process.env.POSTMARK_TOKEN
            },
            body: JSON.stringify({
                'From': "hello@ensembly.app",
                'To': broadcast.to_address.map(to => to).join(","),
                'cc': broadcast.cc_address.map(cc => cc).join(","),
                'bcc': broadcast.bcc_address.map(bcc => bcc).join(","),
                'Subject': broadcast.subject,
                'HtmlBody': thisHtml,
                'TextBody': "",
                'Tag': "BROADCAST"
            })
        })
            .then(response => response.json())
            .then(res => res)
            .catch((err, message) => {
                console.error("failed to send broadcast", err, message);
                return err;
            })
    console.log(pmResponse);
    return pmResponse;
}

export async function GET(request, { params }) {
    const {id} = params;
    const req = await request.json()
    const res = await getOneBroadcast({...req, id})
    return NextResponse.json({ res })
}

export async function PUT(request, { params }) {
    const {id} = params;
    const req = await request.json()
    const res = await updateOneBroadcast({...req, id})
    return NextResponse.json({ res })
}

export async function POST(request, { params }) {
    const { id } = params;
    const req = await request.json()
    const res = await sendBroadcast({ ...req, id })
    return NextResponse.json({ res });
}