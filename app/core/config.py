from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "LeanToken"
    GROQ_API_KEY: str = ""
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = "" 
    SUPABASE_KEY: str = ""  # This is the Service Role Key

    class Config:
        env_file = ".env"

settings = Settings()