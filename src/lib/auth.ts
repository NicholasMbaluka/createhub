import { getServerSession } from 'next-auth'
import { supabase } from './supabase'

export async function getCurrentUser() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return null
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireCreator() {
  const user = await requireAuth()
  
  if (user.role !== 'creator') {
    throw new Error('Creator access required')
  }
  
  return user
}

export async function requireFounder() {
  const user = await requireAuth()
  
  if (user.role !== 'founder') {
    throw new Error('Founder access required')
  }
  
  return user
}
