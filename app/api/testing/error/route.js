import { NextResponse } from 'next/server';

export const returnError = async (props) => {

    console.log("error props:", props);

    if (props) return new Error(props.message, {details: "SO MUCH ERROR!"});

    return true;
}

export async function PUT(request) {
    const req = await request.json()
    const res = await returnError(req)
    console.log("error res:", res)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}