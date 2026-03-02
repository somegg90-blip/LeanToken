import { useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from './supabaseClient'

export default function History({ session }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("Please log in to view history.")
        setLoading(false)
        return
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/history`, {
        headers: { 
          'X-User-Id': user.id 
        }
      })
      
      setHistory(response.data.history || [])
    } catch (err) {
      console.error("History fetch error:", err)
      setError("Failed to load history.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const totalSavings = history.reduce((sum, item) => sum + (item.savings_found || 0), 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Analysis History</h2>
        <div className="text-sm text-zinc-500">
          {history.length} analyses
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-2 text-sm text-zinc-500">Loading history...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 text-sm">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <p className="text-zinc-900 font-medium">No analyses yet</p>
          <p className="text-zinc-500 text-sm mt-1">Upload your first file to see results here.</p>
        </div>
      ) : (
        <>
          {/* Total Savings Card */}
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Savings Found</p>
                <p className="text-2xl font-bold text-emerald-700">${totalSavings.toFixed(4)}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={item.id || index} className="border border-zinc-100 rounded-xl p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-zinc-900">{formatDate(item.created_at)}</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      {item.summary ? item.summary.substring(0, 60) + '...' : 'Analysis completed'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">
                      Cost: <span className="font-medium text-zinc-900">${item.total_cost?.toFixed(4) || '0.00'}</span>
                    </p>
                    <p className="text-sm text-emerald-600 font-medium">
                      Saved: ${item.savings_found?.toFixed(4) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}