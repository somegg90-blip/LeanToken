import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true) 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true) 

  const handleAuth = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  // NEW: Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
      if (error) throw error
    } catch (error) {
      alert(error.error_description || error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans relative">
      
      {onBack && (
        <div className="absolute top-6 left-6">
          <button 
            onClick={onBack}
            className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">LeanToken</h1>
          <p className="text-zinc-500 mt-2 text-sm">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required={true}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-500"
              />
              <span className="ml-2 text-sm text-zinc-600">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors duration-200 shadow-sm disabled:bg-zinc-300"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center">
            <div className="h-px w-full bg-zinc-200"></div>
            <span className="px-4 text-xs text-zinc-400 uppercase font-semibold tracking-wider">Or</span>
            <div className="h-px w-full bg-zinc-200"></div>
        </div>

        {/* Google Login Button */}
        <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-700 py-3 rounded-xl font-medium hover:bg-zinc-50 transition-colors shadow-sm"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
        </button>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-sm text-zinc-500">
            {isSignUp ? 'Already have an account?' : "Need an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-zinc-900 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}