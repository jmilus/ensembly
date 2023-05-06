'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSupabase } from './supabase-provider'

export default function SupabaseListener({ serverAccessToken }) {
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // console.log("server-side auth session:", session);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        console.log("session updated:", {session})
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [serverAccessToken, router, supabase])

  return null
}