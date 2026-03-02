from fastapi import APIRouter, UploadFile, File, HTTPException, Header
import pandas as pd
import io
from app.services.analyzer import analyze_data, supabase  # <--- FIXED IMPORT
from typing import Optional

router = APIRouter()

@router.post("/analyze")
async def analyze_upload(file: UploadFile = File(...), x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload CSV.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        results = analyze_data(df, user_id=x_user_id)
        
        if "error" in results and results["error"] == "limit_reached":
            raise HTTPException(status_code=402, detail=results["message"])
            
        return results

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    
    try:
        response = supabase.table('analyses').select('*').eq('user_id', x_user_id).order('created_at', desc=True).execute()
        return {"history": response.data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))