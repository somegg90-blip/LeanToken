# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # ─────────────────────────────────────────────────────────────
    # 🔧 Pydantic v2 Configuration (CRITICAL for env var loading)
    # ─────────────────────────────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",              # Load from .env in local dev
        env_file_encoding="utf-8",
        case_sensitive=False,         # Allow GROQ_API_KEY or groq_api_key
        extra="ignore",               # Ignore unknown env vars (prevent crashes)
        env_prefix=""                 # No prefix required (e.g., not APP_GROQ_API_KEY)
    )
    
    # ─────────────────────────────────────────────────────────────
    # 🏷️ App Metadata
    # ─────────────────────────────────────────────────────────────
    APP_NAME: str = "LeanToken API"
    ENVIRONMENT: str = "production"  # Override via ENVIRONMENT=development env var
    DEBUG: bool = False
    
    # ─────────────────────────────────────────────────────────────
    # 🔑 API Keys (Required - will raise error if missing in production)
    # ─────────────────────────────────────────────────────────────
    GROQ_API_KEY: str
    
    # ─────────────────────────────────────────────────────────────
    # 🗄️ Supabase Configuration
    # ⚠️ Use SUPABASE_ANON_KEY for backend calls from authenticated users
    #    Use SUPABASE_SERVICE_ROLE_KEY only for server-only admin tasks
    # ─────────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str  # ← Use this one for RLS-protected user queries
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None  # Optional, for admin tasks
    
    # Alias: Allow old code using SUPABASE_KEY to still work
    @property
    def SUPABASE_KEY(self) -> str:
        """Backward compatibility: returns ANON key by default"""
        return self.SUPABASE_ANON_KEY
    
    # ─────────────────────────────────────────────────────────────
    # 🔐 CORS Configuration
    # ─────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated origins into list for FastAPI CORS"""
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        # Add Render frontend domains automatically
        if self.ENVIRONMENT == "production":
            origins.extend([
                "https://*.onrender.com",
                "https://leantoken.com",  # Add your custom domain later
            ])
        return origins
    
    # ─────────────────────────────────────────────────────────────
    # ✅ Validation: Ensure required keys are set in production
    # ─────────────────────────────────────────────────────────────
    def check_required_keys(self):
        """Raise clear errors if required env vars are missing"""
        missing = []
        
        if not self.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if not self.SUPABASE_URL:
            missing.append("SUPABASE_URL")
        if not self.SUPABASE_ANON_KEY:
            missing.append("SUPABASE_ANON_KEY (not SUPABASE_KEY)")
        
        if missing and self.ENVIRONMENT == "production":
            error_msg = f"Missing required environment variables: {', '.join(missing)}"
            logger.error(f"❌ {error_msg}")
            raise ValueError(error_msg)
        
        if missing:
            logger.warning(f"⚠️ Missing env vars (OK in dev): {missing}")

# ─────────────────────────────────────────────────────────────
# 🚀 Singleton Settings Instance (Cached for Performance)
# ─────────────────────────────────────────────────────────────
@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance - call once at app startup"""
    settings = Settings()
    settings.check_required_keys()  # Validate on load
    logger.info(f"✓ Settings loaded: ENV={settings.ENVIRONMENT}, APP={settings.APP_NAME}")
    return settings

# Export singleton instance for easy imports
settings = get_settings()
