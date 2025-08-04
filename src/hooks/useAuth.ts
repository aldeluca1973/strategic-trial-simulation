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
    let authTimeout: NodeJS.Timeout
    
    // Get initial session with timeout to prevent infinite loading
    const getInitialSession = async () => {
      try {
        setError(null)
        
        // Set a timeout to prevent infinite loading
        authTimeout = setTimeout(() => {
          if (mounted) {
            console.log('Auth timeout reached, setting loading to false')
            setLoading(false)
            setUser(null)
          }
        }, 10000) // 10 second timeout
        
        const { data: { session } } = await supabase.auth.getSession()
        
        // Clear timeout if we get a response
        if (authTimeout) {
          clearTimeout(authTimeout)
        }
        
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
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
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
    try {
      // Create user with email confirmation disabled for now
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) return { error }

      // Send our custom branded welcome email
      if (data.user) {
        try {
          // Get the confirmation token from our database
          const { data: tokenData } = await supabase
            .from('email_confirmations')
            .select('confirmation_token')
            .eq('user_id', data.user.id)
            .eq('email_type', 'signup')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (tokenData) {
            const confirmationUrl = `${window.location.origin}/auth/confirm?token=${tokenData.confirmation_token}`
            
            // Send custom branded email
            await fetch(`${window.location.origin}/functions/v1/custom-email-service`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                type: 'welcome',
                confirmationUrl: confirmationUrl
              }),
            })
          }
        } catch (emailError) {
          console.log('Custom email sending failed, but account was created:', emailError)
          // Don't fail the signup if email fails
        }
      }

      return { error: null }
    } catch (signupError) {
      return { error: signupError }
    }
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