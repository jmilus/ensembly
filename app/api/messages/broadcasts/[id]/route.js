import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateEmail } from 'utils';

export const getOneBroadcast = async (id) => {
    const supabase = createServerComponentClient({ cookies });
    console.log("fetch broadcast with id:", id)

    const { data: broadcast, error } = await supabase
        .from("Broadcast")
        .select()
        .eq('id', id)
    
    if (error) {
        console.error("fetch one Broadcast error:", error);
        return new Error(error);
    }

    return broadcast[0];
}

export async function GET({ params }) {
    const res = await getOneBroadcast(params.id)
    return NextResponse.json({ res })
}

//###########

export const duplicateBroadcast = async (broadcastId) => {
    const supabase = createServerComponentClient({ cookies });
    const { data: newBroadcast, error } = await supabase.rpc('clone_broadcast', { broadcast_id: broadcastId })

    if (error) {
        console.error("duplicate Broadcast error:", error);
        return new Error(error);
    }

    return { id: newBroadcast };
}

export async function POST(request, { params }) {
    const res = await duplicateBroadcast(params.id)
    return NextResponse.json(res)
}

// #######

export const updateOneBroadcast = async (props) => {
    const supabase = createServerComponentClient({ cookies });
    console.log("updating broadcast:", props);

    const { id, subject, body, to_address, cc_address, bcc_address, status } = props;

    const { data: broadcast, error } = await supabase
        .from("Broadcast")
        .upsert({
            id: id === "new-broadcast" ? undefined : id,
            subject,
            body,
            to_address,
            cc_address: cc_address ? cc_address.filter(cc => validateEmail(cc)) : [],
            bcc_address: bcc_address ? bcc_address.filter(bcc => validateEmail(bcc)) : [],
            status
        })
        .select()
        .single()
    
    if (error) {
        console.error("save one Broadcast error:", error);
        return new Error(error.message);
    }

    console.log("saved broadcast:", broadcast);
    return broadcast;
}

export async function PUT(request, { params }) {
    const req = await request.json();
    const res = await updateOneBroadcast({ ...req, id: params.id })
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}

//###########

export const deleteOneBroadcast = async (broadcastId) => {
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
        .from("Broadcast")
        .delete()
        .eq('id', broadcastId)
    
    if (error) {
        console.error("delete one Broadcast error:", error);
        return new Error(error);
    }

    return data;
}

export async function DELETE(request, { params }) {
    console.log("DELETE params:", params)
    const res = await deleteOneBroadcast(params.id)
    return NextResponse.json({ res })
}