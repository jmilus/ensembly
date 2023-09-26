import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

import { memberImportFromExcel } from 'utils/importFromExcel';

export const importMembers = async (data) => {
    const { ensembleId, members } = data;
    const supabase = createServerComponentClient({ cookies });
    console.log({ data })

    const importableData = await memberImportFromExcel(members);
    console.log({ importableData })
    
    const {data: importedMembers, membererror} = await supabase
        .from("Member")
        .upsert(importableData, {onConflict: 'firstName, middleName, lastName, suffix'})
        .select()

    if (membererror) {
        console.log("error:", membererror)
        return false;
    }

    if (!ensembleId) return true;

    const newMembershipsList = importedMembers.map(mem => {
        return { member: mem.id, ensemble: ensembleId }
    })

    const { data: results, membershiperror } = await supabase
        .from("EnsembleMembership")
        .insert(newMembershipsList)
        .select()
    
    console.log({ results })
    if (membershiperror) {
        console.log("error:", membershiperror)
        return false
    }

    return true;
}

export async function POST(request) {
    const _req = await request.formData();
    const req = extractFields(_req);
    const res = await importMembers(req)
    return NextResponse.json({ res })
}