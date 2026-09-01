from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Category, Prompt
from app.schemas.models_schema import CategoryResponse, PromptResponse
from app.services.s3 import normalize_image_url

router = APIRouter(
    prefix="/api",
    tags=["app-prompts"]
)

# ── Fetch Categories (App view) ──
@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


# ── Fetch Prompts with filters & search (App view) with 20-20 Pagination ──
@router.get("/prompts", response_model=list[PromptResponse])
def get_prompts(
    category_id: int | None = Query(None, description="Filter prompts by Category ID"),
    search: str | None = Query(None, description="Search prompts by prompt text"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    query = db.query(Prompt)
    
    if category_id is not None:
        query = query.filter(Prompt.category_id == category_id)
        
    if search:
        query = query.filter(Prompt.prompt_text.ilike(f"%{search}%"))
        
    # Apply offset and limit pagination
    offset = (page - 1) * limit
    prompts = query.offset(offset).limit(limit).all()
    
    # Dynamically normalize image_url to CDN if configured
    for p in prompts:
        p.image_url = normalize_image_url(p.image_url)
        
    return prompts


# ── Increment Prompt View Count (App view) ──
@router.post("/prompts/{id}/view", status_code=status.HTTP_200_OK)
def increment_prompt_view(id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    prompt.view_count += 1
    db.commit()
    return {"message": "View count incremented successfully", "views": prompt.view_count}
