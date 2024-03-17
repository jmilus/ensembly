'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { HOSTURL } from 'config'

import { createClient } from 'utils/supabase/server'

export async function userLoggedIn() {
    const supabase = createClient();

    const { data, error } = supabase.auth.getUser();

    if (data?.user) return true;

    return false;
}

export async function loginWithPassword(formData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw error
  }

  revalidatePath('/e', 'layout')
  redirect('/e')
}

export async function loginWithMagicLink(formData) {
    const supabase = createClient();

    const email = formData.get('email')

    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: HOSTURL,
        },
    })

    if (error) {
        throw error
    }

    redirect('/login/otp')
}

export async function signup(formData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}