from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.config import settings
from app.database import engine, Base
from app.routers import admin, prompts

# Create DB Tables automatically on startup
Base.metadata.create_all(bind=engine)

# Auto-migrate: ensure is_trending column exists in prompts table
try:
    with engine.connect() as conn:
        inspector = inspect(engine)
        if "prompts" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("prompts")]
            if "is_trending" not in columns:
                conn.execute(text("ALTER TABLE prompts ADD COLUMN is_trending BOOLEAN DEFAULT FALSE"))
                conn.commit()
except Exception as e:
    print(f"Startup migration notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Prompt Trending Backend for managing AI image prompts with AWS S3 upload",
    version="1.0.0"
)

# CORS middleware config to allow React Native connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(admin.router)
app.include_router(prompts.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to API Server!"}
