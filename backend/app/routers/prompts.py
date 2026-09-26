from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, case, Integer, cast
from datetime import datetime, timedelta
from sqlalchemy.sql.expression import func
from app.database import get_db, is_sqlite
from app.models import Category, Prompt
from app.schemas.models_schema import CategoryResponse, PromptResponse
from app.services.s3 import normalize_image_url

router = APIRouter(
    prefix="/api",
    tags=["app-prompts"]
)

# ── Fetch Categories (App & Admin view) ──
@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(
    include_all: bool = Query(False, description="Include all prompts including inactive AWS S3"),
    db: Session = Depends(get_db)
):
    if not include_all:
        prompt_sub = (
            db.query(Prompt.category_id, func.count(Prompt.id).label("prompt_count"))
            .filter(~Prompt.image_url.contains("amazonaws.com"))
            .group_by(Prompt.category_id)
            .subquery()
        )
    else:
        prompt_sub = (
            db.query(Prompt.category_id, func.count(Prompt.id).label("prompt_count"))
            .group_by(Prompt.category_id)
            .subquery()
        )

    category_counts = (
        db.query(
            Category.id,
            Category.name,
            func.coalesce(prompt_sub.c.prompt_count, 0).label("prompt_count")
        )
        .outerjoin(prompt_sub, Category.id == prompt_sub.c.category_id)
        .order_by(Category.name.asc())
        .all()
    )
    return [
        {
            "id": c.id,
            "name": c.name,
            "prompt_count": c.prompt_count or 0
        }
        for c in category_counts
    ]


# ── Fetch Prompts with filters & search (App view) with Random / Ordered support ──
@router.get("/prompts", response_model=list[PromptResponse])
def get_prompts(
    response: Response,
    category_id: int | None = Query(None, description="Filter prompts by Category ID"),
    is_trending: bool | None = Query(None, description="Filter prompts by trending status"),
    search: str | None = Query(None, description="Search prompts by prompt text"),
    order: str = Query("popular", description="Ordering: 'random', 'latest', 'oldest', 'popular'"),
    include_all: bool = Query(False, description="Include all prompts including inactive S3"),
    only_aws: bool = Query(False, description="Filter only AWS S3 prompts"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=500, description="Items per page"),
    db: Session = Depends(get_db)
):
    # Disable client/proxy caching so every pull/refresh returns freshly randomized data
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    query = db.query(Prompt)
    
    # Conditional AWS filtering
    if only_aws:
        query = query.filter(Prompt.image_url.contains("amazonaws.com"))
    elif not include_all:
        query = query.filter(~Prompt.image_url.contains("amazonaws.com"))
    
    if category_id is not None:
        query = query.filter(Prompt.category_id == category_id)

    if is_trending is not None:
        query = query.filter(Prompt.is_trending == is_trending)
        
    if search:
        query = query.filter(Prompt.prompt_text.ilike(f"%{search}%"))

    # Compute total count for pagination and count badges
    total_count = query.count()
    response.headers["X-Total-Count"] = str(total_count)
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, x-total-count"
        
    # Apply Ordering: Default is random shuffle
    if order == "random":
        query = query.order_by(func.random())
    elif order == "oldest":
        query = query.order_by(Prompt.id.asc())
    elif order in ("popular", "views"):
        if is_sqlite:
            age_in_days = cast(func.julianday('now') - func.julianday(Prompt.created_at), Integer)
        else:
            age_in_days = cast(func.extract('day', func.now() - Prompt.created_at), Integer)
            
        freshness_bonus = case(
            (age_in_days < 20, 100 - (age_in_days * 5)),
            else_=0
        ).cast(Integer)
        
        trending_bonus = case((Prompt.is_trending == True, 50), else_=0).cast(Integer)
        score = (Prompt.copy_count * 10) + (Prompt.favorite_count * 5) + Prompt.view_count + freshness_bonus + trending_bonus
        query = query.order_by(score.desc(), Prompt.created_at.desc())
    else:  # "latest"
        query = query.order_by(Prompt.id.desc())

    offset = (page - 1) * limit
    prompts = query.offset(offset).limit(limit).all()
    
    # Dynamically normalize image_url to CDN if configured and calculate score
    now = datetime.utcnow()
    for p in prompts:
        p.image_url = normalize_image_url(p.image_url)
        s = (p.copy_count * 10) + (p.favorite_count * 5) + p.view_count
        if p.created_at:
            age = (now - p.created_at).days
            if age < 20:
                s += (100 - (age * 5))
        if p.is_trending:
            s += 50
        p.score = s
        
    return prompts


# ── Fetch Trending Prompts Directly (App view dedicated endpoint) ──
@router.get("/prompts/trending", response_model=list[PromptResponse])
def get_trending_prompts(
    response: Response,
    category_id: int | None = Query(None, description="Filter trending prompts by Category ID"),
    order: str = Query("popular", description="Ordering: 'random', 'latest', 'popular'"),
    include_all: bool = Query(False, description="Include all prompts including inactive S3"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    # Disable client/proxy caching so every pull/refresh returns freshly randomized data
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    query = db.query(Prompt).filter(Prompt.is_trending == True)
    
    # Hide inactive AWS S3 images from frontend mobile app
    if not include_all:
        query = query.filter(~Prompt.image_url.contains("amazonaws.com"))
        
    if category_id is not None:
        query = query.filter(Prompt.category_id == category_id)

    # Apply Ordering: Default is random shuffle
    if order == "random":
        query = query.order_by(func.random())
    elif order in ("popular", "views"):
        if is_sqlite:
            age_in_days = cast(func.julianday('now') - func.julianday(Prompt.created_at), Integer)
        else:
            age_in_days = cast(func.extract('day', func.now() - Prompt.created_at), Integer)
            
        freshness_bonus = case(
            (age_in_days < 20, 100 - (age_in_days * 5)),
            else_=0
        ).cast(Integer)
        
        trending_bonus = case((Prompt.is_trending == True, 50), else_=0).cast(Integer)
        score = (Prompt.copy_count * 10) + (Prompt.favorite_count * 5) + Prompt.view_count + freshness_bonus + trending_bonus
        query = query.order_by(score.desc(), Prompt.created_at.desc())
    else:  # "latest"
        query = query.order_by(Prompt.id.desc())

    offset = (page - 1) * limit
    prompts = query.offset(offset).limit(limit).all()
    now = datetime.utcnow()
    for p in prompts:
        p.image_url = normalize_image_url(p.image_url)
        s = (p.copy_count * 10) + (p.favorite_count * 5) + p.view_count
        if p.created_at:
            age = (now - p.created_at).days
            if age < 20:
                s += (100 - (age * 5))
        if p.is_trending:
            s += 50
        p.score = s
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


# ── Increment Prompt Copy Count (App view) ──
@router.post("/prompts/{id}/copy", status_code=status.HTTP_200_OK)
def increment_prompt_copy(id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    prompt.copy_count += 1
    db.commit()
    return {"message": "Copy count incremented successfully", "copies": prompt.copy_count}


# ── Increment Prompt Favorite Count (App view) ──
@router.post("/prompts/{id}/favorite", status_code=status.HTTP_200_OK)
def increment_prompt_favorite(id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    prompt.favorite_count += 1
    db.commit()
    return {"message": "Favorite count incremented successfully", "favorites": prompt.favorite_count}
