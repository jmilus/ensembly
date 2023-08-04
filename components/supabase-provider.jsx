'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase-client';
import { useRouter } from 'next/navigation';

const Context = createContext()

export default function SupabaseProvider({ children }) {
  const [session, setSession] = useState();
  const { accessToken } = Context;
  
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== accessToken) {
        setSession(session)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [accessToken])

  return (
    <Context.Provider value={{ supabase, session }}>
      <>{children}</>
    </Context.Provider>
  )
}

export const useSupabase = () => useContext(Context)