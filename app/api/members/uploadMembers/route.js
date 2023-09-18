import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { memberImportFromExcel } from 'utils/importFromExcel';

export const importMembers = async (data) => {
    console.log({ data })

    // const files = data.keys()
    for (const key of data.keys()) {
        console.log(key);
    }
    
    const ensembleId = data.get('ensembleId');
    const file = data.get('members');



    // console.log({ ensembleId }, { files })

    console.log("files:", file)

    const importableData = await memberImportFromExcel(file, ensembleId);
    console.log({importableData})
    return true;
}

export async function POST(request) {
    const req = await request.formData();
    const res = await importMembers(req)
    return NextResponse.json({ res })
}