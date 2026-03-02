import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function LandingPage({ onGetStarted }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!contactEmail || !contactMessage) return

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{ email: contactEmail, message: contactMessage }])

      if (error) throw error
      setSubmitted(true)
      setContactEmail('')
      setContactMessage('')
    } catch (error) {
      alert('Failed to send message. Please try again.')
    }
  }

  return (
    <div className="bg-zinc-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-zinc-900 font-bold text-xl tracking-tight">LeanToken</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors">Pricing</a>
              <a href="#contact" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors">Contact</a>
              <button 
                onClick={onGetStarted}
                className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm"
              >
                Get Started Free
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-zinc-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-zinc-100 shadow-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-md">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-md">Pricing</a>
              <a href="#contact" className="block px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-md">Contact</a>
              <button onClick={onGetStarted} className="mt-2 w-full bg-zinc-900 text-white px-3 py-2 rounded-md text-sm font-semibold">
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tight leading-tight">
            Stop Burning Money <br />
            <span className="text-zinc-400">on AI.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-zinc-500">
            Most companies waste 30% of their AI budget on inefficient model usage. 
            LeanToken finds the waste and fixes it automatically.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="bg-zinc-900 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Analyze Your First Log Free →
            </button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-zinc-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-zinc-300 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* SEO Content Section: Why LeanToken? */}
      <div className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8">Why Optimize Your LLM Costs?</h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            As AI adoption accelerates, operational costs for GPT-4, Claude, and other Large Language Models (LLMs) are becoming a significant budget line item. Without visibility, teams often default to the most expensive models for trivial tasks. LeanToken helps you implement <strong>FinOps for AI</strong>, ensuring you get the best performance at the lowest cost.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 mb-2">Reduce API Waste</h3>
              <p className="text-sm text-zinc-500">Identify when you're using GPT-4 for tasks GPT-3.5 could handle.</p>
            </div>
            <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 mb-2">Prompt Efficiency</h3>
              <p className="text-sm text-zinc-500">Analyze token usage to shorten prompts and lower latency.</p>
            </div>
            <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 mb-2">Budget Forecasting</h3>
              <p className="text-sm text-zinc-500">Predict monthly spend based on actual usage patterns.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl leading-8 font-bold text-zinc-900 tracking-tight sm:text-4xl">
              Financial Intelligence for AI
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 border border-zinc-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white mb-5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Cost Visualization</h3>
              <p className="text-zinc-500 text-sm">See exactly where your money is going. Identify expensive models and inefficient prompts instantly.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-zinc-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500 text-white mb-5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Waste Detection</h3>
              <p className="text-zinc-500 text-sm">Find out if you're using GPT-4 for simple tasks that GPT-3.5 could handle for 1/60th the price.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-zinc-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white mb-5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">AI Insights</h3>
              <p className="text-zinc-500 text-sm">Get executive summaries generated by AI. Understand your spend without digging through data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Simple Pricing</h2>
            <p className="mt-4 text-zinc-500">Start for free. Upgrade Later.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 justify-items-center">
            {/* Tier 1: Free Trial */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8 flex flex-col w-full max-w-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Free Trial</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-zinc-900">$0</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500 mb-6">Try LeanToken risk-free.</p>
              <ul className="mt-2 space-y-2 flex-grow text-sm text-zinc-600">
                <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> 1 Free Analysis</li>
                <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Cost Breakdown</li>
                <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> AI Insights</li>
              </ul>
              <button onClick={onGetStarted} className="mt-8 w-full py-3 bg-zinc-900 rounded-xl text-sm font-semibold text-white hover:bg-zinc-800 transition-colors">
                Get Started
              </button>
            </div>

            {/* Tier 2: Startup (Highlighted) */}
            <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col w-full max-w-sm relative shadow-xl transform scale-105 border border-zinc-800">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Startup</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="ml-2 text-zinc-400">/mo</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400 mb-6">For small teams optimizing costs.</p>
              <ul className="mt-2 space-y-2 flex-grow text-sm text-zinc-300">
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> Unlimited Analyses</li>
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> Team Dashboard</li>
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> Export Reports</li>
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> Priority Support</li>
              </ul>
              <button onClick={onGetStarted} className="mt-8 w-full py-3 bg-white rounded-xl text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors">
                Create Account
              </button>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8 flex flex-col w-full max-w-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Enterprise</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-bold text-zinc-900">Coming Soon</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500 mb-6">For agencies and large corps.</p>
              <ul className="mt-2 space-y-2 flex-grow text-sm text-zinc-600">
                <li className="flex items-center"><span className="text-zinc-300 mr-2">✓</span> Everything in Startup</li>
                <li className="flex items-center"><span className="text-zinc-300 mr-2">✓</span> SSO & Security</li>
                <li className="flex items-center"><span className="text-zinc-300 mr-2">✓</span> Dedicated Support</li>
              </ul>
              <a href="#contact" className="mt-8 w-full py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors block text-center">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Get In Touch</h2>
            <p className="mt-4 text-zinc-500">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Message Sent!</h3>
                <p className="text-zinc-500 text-sm mt-2">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">Your Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-900 py-12 text-center text-zinc-400 text-sm border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center mb-4">
             <div className="w-6 h-6 bg-zinc-700 rounded flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">L</span>
             </div>
             <span className="text-white font-semibold">LeanToken</span>
          </div>
          <p>© 2026 LeanToken. All rights reserved.</p>
          <p className="mt-2 text-xs">Built for AI-first teams. Saving money, one token at a time.</p>
        </div>
      </footer>
    </div>
  )
}