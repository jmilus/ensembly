import { createClient } from 'utils/supabase/server';

import { NextResponse } from 'next/server';

export const getManyEmails = async (group, groupId) => {
    const supabase = createClient();

    switch (group) {
        case "ensemble":
            const query = supabase
                .from("Ensemble")
                .select(`
                    name,
                    Division(*),
                    Lineup(name, LineupAssignment(Division(id, name, parent_division), EnsembleMembership(Member(id, aka, EmailAddress(email)))))
                `)

            if (groupId) query.eq('id', groupId)
            
            const { data: myresult, error } = await query;

            if (error) console.log({ error })
            return myresult;
                // .eq('Member.EnsembleMembership.Ensemble.id', groupId)
        default:
            return null;
    }
}

export async function GET(request) {
    const req = await request.json()
    const res = await getManyEmails(req);
    return NextResponse.json({ res })
}