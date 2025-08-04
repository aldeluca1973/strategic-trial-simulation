import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentUser } = useGameStore()

  useEffect(() => {
    let mounted = true
    
    // Get initial session - simplified without timeout
    const getInitialSession = async () => {
      try {
        setError(null)
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setError('Failed to load session')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state change:', event, !!session?.user)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setCurrentUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    setProfileLoading(true)
    setError(null)
    
    try {
      console.log('Loading profile for user:', userId)
      
      // Try to load existing profile first
      const { data: existingProfile, error: loadError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (existingProfile) {
        console.log('Profile loaded successfully:', existingProfile)
        setProfile(existingProfile)
        setCurrentUser(existingProfile)
        return
      }

      // If no profile exists, create one
      console.log('Creating new profile for user:', userId)
      
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      const newProfile: Partial<Profile> = {
        id: userId,
        email: currentUser?.email || '',
        full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User',
        games_played: 0,
        total_score: 0
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      console.log('Profile created successfully:', createdProfile)
      setProfile(createdProfile)
      setCurrentUser(createdProfile)
      
    } catch (error) {
      console.error('Error in loadProfile:', error)
      setError('Failed to load profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user') }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
      setCurrentUser(data)
    }

    return { data, error }
  }

  return {
    user,
    profile,
    loading: loading || profileLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile
  }
}