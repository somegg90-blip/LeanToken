from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)

# CORS: Allow your future frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Lock this down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "LeanToken API is running"}