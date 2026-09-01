import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Prompt Gallery Backend"
    
    # Database Config - Loads Neon DB URL from env, falls back to SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # AWS S3 Config
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "AKIA6PBBDMMXW4FJKOXV")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "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")
    AWS_REGION: str = os.getenv("AWS_REGION", "eu-north-1")
    AWS_S3_BUCKET_NAME: str = os.getenv("AWS_S3_BUCKET_NAME", "2026promptbucket")
    AWS_S3_CUSTOM_DOMAIN: str = os.getenv("AWS_S3_CUSTOM_DOMAIN", "")
    
    # JWT & Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

settings = Settings()
