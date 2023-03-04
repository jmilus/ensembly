'use client'

import { createContext, useContext, useState } from 'react'
import { createClient } from '../utils/supabase-server'

const Context = createContext()

export default function SupabaseProvider({ children }) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== accessToken) {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [accessToken])

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  )
}

export const useSupabase = () => useContext(Context)