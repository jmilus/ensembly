import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const createUser = async (member) => {
    const supabase = createServerComponentClient({ cookies });

    const {data, error} = await supabase.auth.signUp(
        {
            email: member.email,
            password: member.password || "temporary"
        }
    )
    return data;
}