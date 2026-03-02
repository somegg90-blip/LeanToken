import { useState } from 'react'
import axios from 'axios'
import { supabase } from './supabaseClient'
import History from './History'

export default function Dashboard({ session }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Luxury Formatting Function
  const formatCurrency = (amount) => {
    if (amount < 0.1 && amount > 0) return `${(amount * 100).toFixed(2)} cents`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("Please log in to analyze.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      // 2. Send the User ID in the headers
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/analyze`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'X-User-Id': user.id 
        }
      });
      
      setResult(response.data);
    } catch (err) {
      // Handle the specific "Payment Required" error
      if (err.response && err.response.status === 402) {
        setError(err.response.data.detail); // "You have used your 1 free analysis..."
      } else {
        setError(err.response?.data?.detail || "Analysis failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/create-checkout`, {}, {
        headers: { 
          'X-User-Id': user.id,
          'X-User-Email': user.email
        }
      })
      
      // Redirect user to Paddle Checkout
      window.location.href = response.data.checkout_url
      
    } catch (err) {
      setError("Failed to initiate checkout. Please contact support.")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">LeanToken</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-500 hidden sm:block">{session.user.email}</span>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        
        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 mb-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Cost Analysis</h2>
            <p className="text-zinc-500 text-sm mb-6">Upload your usage log to identify savings.</p>

            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 hover:border-zinc-400 transition-colors bg-zinc-50/50">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
              />
            </div>

            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-6 w-full bg-zinc-900 text-white py-3.5 rounded-xl font-semibold hover:bg-zinc-800 transition-all duration-200 shadow-sm disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Analyze Report"}
            </button>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-red-700 font-medium text-sm mb-3">{error}</p>
                {/* Show Upgrade Button if it's a limit error */}
                {error.includes("upgrade") && (
                  <button 
                    onClick={handleUpgrade}
                    className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Upgrade to Pro ($99/mo)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <History session={session} />
        
        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-6 animate-fade-in">
            
            {result.savings_found === 0 ? (
               <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
                 <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="text-2xl">✨</span>
                 </div>
                 <h3 className="text-xl font-semibold text-zinc-900">Perfect Efficiency</h3>
                 <p className="text-zinc-500 mt-2">We found no wasted spend in this file.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Total Analyzed</p>
                  <p className="text-4xl font-bold text-zinc-900">{formatCurrency(result.total_cost)}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                     <p className="text-xs text-zinc-400">{result.issues_count} optimization points found</p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6">
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-2">Potential Savings</p>
                  <p className="text-4xl font-bold text-emerald-700">{formatCurrency(result.savings_found)}</p>
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                     <p className="text-xs text-emerald-600 font-medium">Estimated Annual: {formatCurrency(result.savings_found * 12)}</p>
                  </div>
                </div>
              </div>
            )}

            {result.savings_found > 0 && (
              <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-50"></div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">AI Executive Summary</h3>
                </div>
                <p className="text-zinc-100 text-sm leading-relaxed">{result.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}