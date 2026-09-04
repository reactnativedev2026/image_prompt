from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import admin, prompts

# Create DB Tables automatically on startup
Base.metadata.create_all(bind=engine)

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
