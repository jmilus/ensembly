import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';


const defaultOptions = ['sex', 'race', 'hair', 'eyes']

export const getBioOptions = async (options=defaultOptions) => {
    const supabase = createServerComponentClient({ cookies });
    console.log({options})
    
    const optionGetters = {
        sex: supabase.from('Sex').select('*'),
        race: supabase.from('Race').select('*'),
        hair: supabase.from('HairColor').select('*'),
        eyes: supabase.from('EyeColor').select('*')
    }
    let bioOptions = {};
    
    await Promise.all(options.map(async option => {
        const { data, error } = await optionGetters[option]
        if(error) return new Error(`error fetching BioOptions: ${error}`)
        bioOptions[option] = data;
    }))

    return bioOptions;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getBioOptions(req)
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}
