# app/api/routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
import pandas as pd
import io
import logging
from typing import Optional

# ✅ FIXED IMPORT: Use lazy client getter instead of direct supabase import
from app.services.analyzer import analyze_data, get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze", tags=["Analysis"])
async def analyze_upload(
    file: UploadFile = File(...), 
    x_user_id: Optional[str] = Header(None)
):
    """Upload CSV and get LLM cost analysis"""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated. Please send x-user-id header.")

    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    try:
        # Read and parse CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Run analysis (RLS-protected inside analyze_data)
        results = analyze_data(df, user_id=x_user_id)
        
        # Handle free tier limit
        if results.get("error") == "limit_reached":
            raise HTTPException(status_code=402, detail=results["message"])
            
        return results

    except UnicodeDecodeError:
        logger.error(f"CSV decode error for user {x_user_id}")
        raise HTTPException(status_code=400, detail="File encoding error. Please use UTF-8 CSV.")
    except HTTPException:
        raise  # Re-raise HTTP errors as-is
    except Exception as e:
        logger.error(f"Analysis error for user {x_user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")

@router.get("/history", tags=["Analysis"])
async def get_history(x_user_id: Optional[str] = Header(None)):
    """Get user's analysis history (RLS-protected)"""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated. Please send x-user-id header.")
    
    try:
        # ✅ FIXED: Use lazy client getter
        supabase = get_supabase_client()
        
        response = (supabase
            .table('analyses')
            .select('id, total_cost, savings_found, summary, created_at')  # Only return needed fields
            .eq('user_id', x_user_id)
            .order('created_at', desc=True)
            .limit(20)  # Prevent huge responses
            .execute())
        
        return {"history": response.data or []}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"History fetch error for user {x_user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load history. Please try again.")

@router.get("/health", tags=["System"])
async def health_check():
    """Simple health check for Render monitoring"""
    return {"status": "ok", "service": "LeanToken API"}
