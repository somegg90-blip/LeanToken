# app/services/analyzer.py
import pandas as pd
import tiktoken
import logging
from typing import Optional, Dict, List, Any
from groq import Groq
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# 🔋 Lazy Client Initialization (Initialize on first use)
# ─────────────────────────────────────────────────────────────
_groq_client: Optional[Groq] = None
_supabase_client: Optional[Client] = None

def get_groq_client() -> Groq:
    """Lazy-load Groq client with error handling"""
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            logger.error("GROQ_API_KEY not set in environment")
            raise ValueError("GROQ_API_KEY environment variable is required")
        try:
            _groq_client = Groq(api_key=settings.GROQ_API_KEY)
            logger.info("✓ Groq client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            raise
    return _groq_client

def get_supabase_client() -> Client:
    """Lazy-load Supabase client with error handling"""
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.error("Supabase credentials not set")
            raise ValueError("SUPABASE_URL and SUPABASE_KEY are required")
        try:
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("✓ Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    return _supabase_client

# ─────────────────────────────────────────────────────────────
# 💰 Pricing Data (per 1M tokens, in USD)
# ─────────────────────────────────────────────────────────────
PRICING = {
    "gpt-4": {"input": 30.00, "output": 60.00},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "claude-3-opus": {"input": 15.00, "output": 75.00},
    "claude-3-sonnet": {"input": 3.00, "output": 15.00},
    "claude-3-haiku": {"input": 0.25, "output": 1.25},
    "llama-3.1-8b-instant": {"input": 0.05, "output": 0.08},  # Groq pricing
}

# ─────────────────────────────────────────────────────────────
# 🔢 Token Counting
# ─────────────────────────────────────────────────────────────
def count_tokens(text: str, model: str) -> int:
    """Count tokens using tiktoken with fallback"""
    if not text:
        return 0
    try:
        # Handle model name variations
        model_key = model.lower().replace("-", "").replace("_", "")
        if model_key in ["gpt4", "gpt4turbo", "gpt4o"]:
            model = model.replace("gpt4", "gpt-4").replace("gpt4o", "gpt-4o")
        
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fallback to cl100k_base (works for most OpenAI/Groq models)
        encoding = tiktoken.get_encoding("cl100k_base")
    except Exception as e:
        logger.warning(f"Token counting fallback for model {model}: {e}")
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(str(text)))

def calculate_cost(tokens: int, model: str, type: str) -> float:
    """Calculate cost in USD for given tokens"""
    if not model or model not in PRICING:
        # Default to cheapest reasonable model
        model = "gpt-3.5-turbo"
    
    if type not in ["input", "output"]:
        type = "input"
    
    rate = PRICING[model][type]
    return (tokens / 1_000_000) * rate

# ─────────────────────────────────────────────────────────────
# 📊 Main Analysis Function (RLS-Safe)
# ─────────────────────────────────────────────────────────────
def analyze_data(df: pd.DataFrame, user_id: str) -> Dict[str, Any]:
    """
    Analyze LLM usage data and return cost insights.
    
    Args:
        df: DataFrame with columns: prompt, completion, model
        user_id: Authenticated user ID from Supabase Auth
    
    Returns:
        Dict with cost analysis, savings opportunities, and summary
    """
    logger.info(f"Starting analysis for user {user_id}")
    
    total_cost = 0.0
    potential_savings = 0.0
    analysis_results: List[Dict] = []
    
    try:
        supabase = get_supabase_client()
        
        # ─── Usage Limit Check (Free Tier: 1 analysis per user) ───
        response = supabase.table('analyses').select('id', count='exact').eq('user_id', user_id).execute()
        count = getattr(response, 'count', 0)
        
        if count >= 1:
            logger.warning(f"User {user_id} hit free tier limit")
            return {
                "error": "limit_reached",
                "message": "You have used your 1 free analysis. Please upgrade to continue.",
                "upgrade_url": "/pricing"
            }
        
        # ─── Data Preprocessing ───
        df.columns = df.columns.str.strip().str.lower()
        required_cols = ['prompt', 'completion', 'model']
        
        for col in required_cols:
            if col not in df.columns:
                df[col] = ""  # Fill missing columns with empty string
        
        # ─── Row-by-Row Analysis ───
        for index, row in df.iterrows():
            try:
                prompt = str(row.get('prompt', '') or '')
                completion = str(row.get('completion', '') or '')
                model = str(row.get('model', 'gpt-3.5-turbo')).strip().lower()
                
                # Normalize model names
                if model in ["gpt4", "gpt-4"]:
                    model = "gpt-4"
                elif model in ["gpt4turbo", "gpt-4-turbo"]:
                    model = "gpt-4-turbo"
                
                # Count tokens
                input_tokens = count_tokens(prompt, model)
                output_tokens = count_tokens(completion, model)
                
                # Calculate cost
                model_key = model if model in PRICING else "gpt-3.5-turbo"
                input_cost = calculate_cost(input_tokens, model_key, 'input')
                output_cost = calculate_cost(output_tokens, model_key, 'output')
                row_cost = input_cost + output_cost
                total_cost += row_cost
                
                # ─── Optimization Opportunity Detection ───
                # Flag overkill: using expensive model for short/simple tasks
                if "gpt-4" in model and input_tokens < 500:
                    cheaper_model = "gpt-3.5-turbo"
                    cheaper_cost = (
                        calculate_cost(input_tokens, cheaper_model, 'input') + 
                        calculate_cost(output_tokens, cheaper_model, 'output')
                    )
                    saving = row_cost - cheaper_cost
                    
                    if saving > 0.001:  # Only flag meaningful savings
                        potential_savings += saving
                        analysis_results.append({
                            "row": index + 1,  # 1-based for UX
                            "type": "Overkill Model",
                            "detail": f"Used {model} for short prompt ({input_tokens} tokens)",
                            "suggestion": f"Switch to {cheaper_model} to save ~${saving:.4f}",
                            "saved": round(saving, 4)
                        })
                        
            except Exception as e:
                logger.warning(f"Error processing row {index}: {e}")
                continue  # Skip bad rows, don't fail entire analysis
        
        # ─── AI-Powered Summary (Optional, non-blocking) ───
        summary_text = f"Analysis complete: ${total_cost:.2f} total, ${potential_savings:.2f} potential savings."
        
        try:
            groq_client = get_groq_client()
            summary_prompt = (
                f"Summarize in one sentence: Total cost ${total_cost:.2f}, "
                f"potential savings ${potential_savings:.2f} across {len(analysis_results)} issues. "
                f"Be concise and actionable."
            )
            
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": summary_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.3,
                max_tokens=100
            )
            if chat_completion.choices:
                summary_text = chat_completion.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"AI summary generation failed (non-critical): {e}")
            # Fallback to template summary
            summary_text = f"Found {len(analysis_results)} optimization opportunities. Potential savings: ${potential_savings:.2f}"
        
        # ─── Save Analysis to Database (RLS-Protected) ───
        try:
            supabase.table('analyses').insert({
                "user_id": user_id,
                "total_cost": round(total_cost, 4),
                "savings_found": round(potential_savings, 4),
                "issues_count": len(analysis_results),
                "summary": summary_text,
                "model_breakdown": {},  # Extend later with per-model stats
                "metadata": {
                    "rows_processed": len(df),
                    "analysis_version": "1.0"
                }
            }).execute()
            logger.info(f"Saved analysis for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to save analysis to Supabase: {e}")
            # Don't fail the response if DB write fails
        
        # ─── Return Results ───
        return {
            "success": True,
            "total_cost": round(total_cost, 4),
            "savings_found": round(potential_savings, 4),
            "savings_percent": round((potential_savings / max(total_cost, 0.01)) * 100, 1),
            "issues_count": len(analysis_results),
            "issues": analysis_results[:10],  # Top 10 for UX
            "summary": summary_text,
            "next_steps": [
                "Review flagged rows for model downgrade opportunities",
                "Consider batching short prompts to reduce overhead",
                "Upgrade to Startup plan for unlimited analyses"
            ] if potential_savings > 0 else []
        }
        
    except Exception as e:
        logger.error(f"Analysis failed for user {user_id}: {e}", exc_info=True)
        return {
            "error": "analysis_failed",
            "message": "An error occurred during analysis. Please try again.",
            "details": str(e) if settings.ENVIRONMENT == "development" else None
        }
