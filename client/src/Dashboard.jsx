import { useState } from 'react'
import axios from 'axios'
import { supabase } from './supabaseClient'
import CostChart from './CostChart'

import History from './History'

export default function Dashboard({ session }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Format currency helper
  const formatCurrency = (amount) => {
    if (amount < 0.01) {
      return `${(amount * 100).toFixed(2)} cents`;
    } else if (amount >= 1) {
      return `$${amount.toFixed(2)}`
    } else if (amount < 1000) {
      return `$${amount.toFixed(2)}k`
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Please log in to upload your file.");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/analyze`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'X-User-Id': user.id,
          'X-User-Email': user.email
        }
      });
      
      setResult(response.data);
    } catch (err) {
      if (err.response && err.response.status === 402) {
        setError(err.response?.data?.detail || "Analysis failed.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Failed to initiate checkout.");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/create-checkout`, formData, {
        headers: { 
          'X-User-Id': user.id,
          'X-User-Email': user.email
        }
      });
      
      // Redirect user to Paddle Checkout
      window.location.href = response.data.checkout_url
      
    } catch (err) {
      setError("Failed to initiate checkout.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      
                    {/* Upload Area */}
                    <div className="border-2 border-zinc-200 rounded-xl p-6 text-center hover:border-zinc-300 transition-colors">
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100 cursor-pointer"
                        />
                        <button 
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="mt-4 w-full bg-zinc-900 text-white py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:bg-gray-300"
                        >
                        {loading ? "Analyzing..." : "Analyze Costs"}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-lg text-sm text-center">
                    <p className="text-red-600 text-sm">{error}</p>
                    {/* Show Upgrade Button if it's a limit error */}
                    {error.includes("upgrade") && (
                      <button 
                        onClick={handleUpgrade}
                        className="mt-4 bg-zinc-900 text-white px-6 rounded-lg text-sm font-semibold hover:bg-zinc-800"
                      >
                        Upgrade to Pro ($99/mo)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="mt-8">
        <History session={session} />
      </div>
    </div>
  );
}
