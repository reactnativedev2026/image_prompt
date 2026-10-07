import time
import random
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, case, Integer, BigInteger, cast
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

# In-memory session seed cache for backend-only smooth pagination per client
_session_seed_cache: dict[str, tuple[int, float]] = {}

def _get_or_create_seed(request: Request, page: int, explicit_seed: int | None = None, key_prefix: str = "") -> int:
    """
    Manages deterministic session seeds entirely on the backend:
    - On page 1 (initial open or pull-to-refresh): generates a fresh random seed.
    - On page > 1 (scroll pagination): reuses the page 1 seed for this client so no duplicates or gaps occur.
    """
    if explicit_seed is not None:
        return abs(int(explicit_seed)) % 2147483647

    now = time.time()
    # Periodic cleanup of sessions older than 30 minutes
    if len(_session_seed_cache) > 1000:
        for k in list(_session_seed_cache.keys()):
            if now - _session_seed_cache[k][1] > 1800:
                del _session_seed_cache[k]

    # Build unique client key from IP + User Agent + Category
    client_ip = ""
    if request.headers.get("x-forwarded-for"):
        client_ip = request.headers.get("x-forwarded-for").split(",")[0].strip()
    elif request.client:
        client_ip = request.client.host
    
    user_agent = request.headers.get("user-agent", "")[:40]
    session_key = f"{client_ip}_{user_agent}_{key_prefix}"

    if page == 1 or session_key not in _session_seed_cache:
        seed_val = random.randint(1, 2147483646)
        _session_seed_cache[session_key] = (seed_val, now)
        return seed_val
    else:
        seed_val, _ = _session_seed_cache[session_key]
        _session_seed_cache[session_key] = (seed_val, now)
        return seed_val

def _build_prioritized_ordering(db: Session, seed_val: int, only_trending: bool = False):
    """
    Builds a dynamic randomized ordering that gives heavy priority to:
    1. Trending prompts (+500 bonus)
    2. Newly added prompts (recent creation date or newest IDs, +400 to +500 bonus)
    3. Moderate engagement boost (capped at 250 so old items do not hijack the top forever)
    4. Random jitter (0 to 500) seeded deterministically per session,
       ensuring users see fresh variety every refresh while bottom/new items get discovered.
    """
    if is_sqlite:
        age_in_days = cast(
            func.julianday('now') - func.julianday(func.coalesce(Prompt.created_at, '2024-01-01')),
            Integer
        )
    else:
        age_in_days = cast(
            func.extract('day', func.now() - func.coalesce(Prompt.created_at, func.to_timestamp(0))),
            Integer
        )

    # Detect high/recent IDs (e.g. freshly uploaded items in admin)
    max_id = db.query(func.coalesce(func.max(Prompt.id), 0)).scalar() or 0
    recent_id_threshold = max(0, max_id - 75)

    # 1. Trending priority bonus
    if not only_trending:
        trending_bonus = case((Prompt.is_trending == True, 500), else_=0).cast(Integer)
    else:
        trending_bonus = 0

    # 2. Freshness & New items bonus
    freshness_bonus = case(
        (age_in_days < 3, 500),
        (age_in_days < 7, 450),
        (Prompt.id >= recent_id_threshold, 400),
        (age_in_days < 14, 350),
        (age_in_days < 30, 250),
        (age_in_days < 60, 150),
        else_=0
    ).cast(Integer)

    # 3. Engagement bonus (capped at 250 so runaway view/copy counts don't bury new content)
    raw_engagement = (Prompt.copy_count * 5) + (Prompt.favorite_count * 3) + Prompt.view_count
    engagement_bonus = case(
        (raw_engagement > 250, 250),
        else_=raw_engagement
    ).cast(Integer)

    # 4. LCG pseudo-random distribution jitter (0 to 499)
    random_jitter = (
        func.abs((cast(Prompt.id, BigInteger) * 1103515245 + seed_val) % 2147483647) % 500
    ).cast(Integer)

    return (trending_bonus + freshness_bonus + engagement_bonus + random_jitter).label("priority_rank")


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
    request: Request,
    response: Response,
    category_id: int | None = Query(None, description="Filter prompts by Category ID"),
    is_trending: bool | None = Query(None, description="Filter prompts by trending status"),
    search: str | None = Query(None, description="Search prompts by prompt text"),
    order: str = Query("popular", description="Ordering: 'random', 'latest', 'oldest', 'popular', 'points'"),
    seed: int | None = Query(None, description="Random seed for consistent pagination during a session"),
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
    
    # Resolve Seed for pagination consistency (backend-handled session cache)
    seed_val = _get_or_create_seed(
        request, 
        page=page, 
        explicit_seed=seed, 
        key_prefix=f"prompts_{category_id}_{is_trending}_{order}_{search or ''}"
    )
    
    response.headers["X-Seed"] = str(seed_val)
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, x-total-count, X-Seed, x-seed"
        
    # Apply Ordering:
    # 'popular', 'random', 'default', 'views' all use prioritized random distribution (trending + new first + fresh shuffle)
    if order in ("popular", "random", "default", "views"):
        priority_rank = _build_prioritized_ordering(db, seed_val, only_trending=False)
        query = query.order_by(priority_rank.desc(), Prompt.id.desc())
    elif order == "oldest":
        query = query.order_by(Prompt.id.asc())
    elif order == "latest":
        query = query.order_by(Prompt.id.desc())
    elif order in ("strict_popular", "points"):
        # Deterministic score ordering without random jitter
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
    else:
        # Fallback to prioritized random
        priority_rank = _build_prioritized_ordering(db, seed_val, only_trending=False)
        query = query.order_by(priority_rank.desc(), Prompt.id.desc())

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
    request: Request,
    response: Response,
    category_id: int | None = Query(None, description="Filter trending prompts by Category ID"),
    order: str = Query("popular", description="Ordering: 'random', 'latest', 'popular'"),
    seed: int | None = Query(None, description="Random seed for consistent pagination during a session"),
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

    # Resolve Seed for pagination consistency (backend-handled session cache)
    seed_val = _get_or_create_seed(
        request, 
        page=page, 
        explicit_seed=seed, 
        key_prefix=f"trending_{category_id}_{order}"
    )
    
    response.headers["X-Seed"] = str(seed_val)
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, x-total-count, X-Seed, x-seed"

    # Apply Ordering: Default is prioritized random shuffle
    if order in ("popular", "random", "default", "views"):
        priority_rank = _build_prioritized_ordering(db, seed_val, only_trending=True)
        query = query.order_by(priority_rank.desc(), Prompt.id.desc())
    elif order == "latest":
        query = query.order_by(Prompt.id.desc())
    elif order == "oldest":
        query = query.order_by(Prompt.id.asc())
    else:
        priority_rank = _build_prioritized_ordering(db, seed_val, only_trending=True)
        query = query.order_by(priority_rank.desc(), Prompt.id.desc())

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
