import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Dashboard from './Dashboard'
import LandingPage from './LandingPage'

function App() {
  const [session, setSession] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // LOGIC:
  // If logged in -> Show Dashboard
  // If clicked "Get Started" -> Show Auth Page
  // Default -> Show Landing Page
  
  if (session) {
    return <Dashboard session={session} />
  }
  
  if (showAuth) {
    return <Auth onBack={() => setShowAuth(false)} />
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />
}

export default App