import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

// export async function middleware(req) {
//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set('my-url', req.url)
  
//   const res = NextResponse.next({ request: { headers: requestHeaders } })
  
//   const supabase = createMiddlewareClient({ req, res })
//   const { data: { session }, error } = await supabase.auth.getSession()
//   if (error) console.log("middleware session error:", error)
//   if (session) console.log("middleware session:", session);

//   return res;
// }

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}