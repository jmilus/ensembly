import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getOneEmail = async ({member, type}) => {
    const supabase = createServerComponentClient({ cookies });

    console.log("fetch member email:", member, type)

    const { data: [{email}], error } = await supabase
        .from('EmailAddress')
        .select('email')
        .eq('member', member)
        .eq('type', type)
    
    if (error) console.error("fetch email error:", error);

    return email;
}

export const getManyEmails = async ({ group, groupId }) => {
    const supabase = createServerComponentClient({ cookies });

    switch (group) {
        case "ensemble":
            

            
                // .eq('Member.EnsembleMembership.Ensemble.id', groupId)
            break;
        default:
            break;
    }

    // const { data: emails, error } = await query;

    return null;
}

export async function GET(request) {
    const req = await request.json()
    const group = req.group || false;
    const res = group ? await getManyEmails(req) : await getOneEmail(req);
    return NextResponse.json({ res })
}