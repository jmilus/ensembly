import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';


const defaultOptions = ['sex', 'race', 'hair', 'eyes']

export const getBioOptions = async (options=defaultOptions) => {
    const supabase = createServerComponentClient({ cookies });
    const Sex = async () => {
        const { data: sex, error } = await supabase.from('Sex').select('*')
        return sex;
    }
    
    const Race = async () => {
        const { data: race, error } = await supabase.from('Race').select('*')
        return race;
    }
    
    const Hair = async () => {
        const { data: hair, error } = await supabase.from('HairColor').select('*')
        return hair;
    }
    
    const Eyes = async () => {
        const { data: eyes, error } = await supabase.from('EyeColor').select('*')
        return eyes;
    }
    
    const optionGetters = {
        sex: Sex(),
        race: Race(),
        hair: Hair(),
        eyes: Eyes()
    }
    let bioOptions = {};
    
    const getTheseOptions = options.map(option => optionGetters[option])

    const stuff = await Promise.all(getTheseOptions).then(optionsCollection => {
        console.log({optionsCollection});
        return optionsCollection;
    })

    // console.log({ stuff })
    stuff.forEach((set, s) => {
        bioOptions[options[s]] = set;
    })

    return bioOptions;
}

export async function GET(request) {
    const req = await request.json()
    const res = await getBioOptions(req)
    return NextResponse.json({ res })
}
