import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('my-url', req.url)
  
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return res
}