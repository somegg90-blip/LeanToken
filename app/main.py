# main.py
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.config import settings

# ─────────────────────────────────────────────────────────────
# 🔧 Logging Configuration (For Render Debugging)
# ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# 🔄 Lifespan Events (Startup/Shutdown)
# ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting LeanToken API...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'production')}")
    
    # TODO: Initialize Supabase client here if not already done in config
    # from app.core.supabase import init_supabase
    # init_supabase()
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down LeanToken API...")

# ─────────────────────────────────────────────────────────────
# 🏗️ FastAPI App Initialization
# ─────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ─────────────────────────────────────────────────────────────
# 🔐 CORS Middleware (Tighten for Production)
# ─────────────────────────────────────────────────────────────
# Get allowed origins from environment variable (set in Render)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # ← Configurable via env var
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# 📡 Include API Routes
# ─────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")

# ─────────────────────────────────────────────────────────────
# 🩺 Health Check Endpoint (Required for Render)
# ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """Render health check - returns 200 if service is alive"""
    return {
        "status": "ok",
        "service": "LeanToken API",
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
def root():
    """API entry point"""
    return {
        "message": "LeanToken API is running",
        "docs": "/docs",
        "health": "/health",
        "api_prefix": "/api/v1"
    }

# ─────────────────────────────────────────────────────────────
# 🧪 Debug Endpoint (Remove in Production if Desired)
# ─────────────────────────────────────────────────────────────
@app.get("/debug/env", tags=["System"])
async def debug_environment():
    """Check environment variables are loaded (exclude secrets)"""
    return {
        "ENVIRONMENT": os.getenv("ENVIRONMENT", "not set"),
        "ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS", "not set"),
        "SUPABASE_URL": "✓ set" if os.getenv("SUPABASE_URL") else "✗ missing",
        "PORT": os.getenv("PORT", "10000"),
    }

# ─────────────────────────────────────────────────────────────
# 🏃 Entry Point for Render (gunicorn-compatible)
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=1
    )
