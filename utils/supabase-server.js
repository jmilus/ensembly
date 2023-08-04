import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () =>
  createServerComponentClient({
    headers,
    cookies,
  })