import re
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import Admin, Category, Prompt
from app.schemas.models_schema import (
    AdminRegisterRequest, AdminLoginRequest, TokenResponse,
    CategoryCreateRequest, CategoryResponse,
    PromptCreateRequest, PromptResponse, PromptUpdateRequest
)
from app.routers.auth_utils import hash_password, verify_password, create_access_token, get_current_admin
from app.services.s3 import upload_image_to_s3, rename_or_move_s3_image, delete_s3_image

router = APIRouter(
    prefix="/api/admin",
    tags=["admin-auth"]
)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_admin(payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    # Check if admin already exists
    existing_admin = db.query(Admin).filter(Admin.username == payload.username).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin username already registered"
        )
    
    # Hash password and create admin record
    new_admin = Admin(
        username=payload.username,
        password_hash=hash_password(payload.password)
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    # Generate access token
    token = create_access_token({"sub": new_admin.username, "admin_id": new_admin.id})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login_admin(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == payload.username).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate token
    token = create_access_token({"sub": admin.username, "admin_id": admin.id})
    return {"access_token": token, "token_type": "bearer"}


# ── AWS S3 Media Upload API ──
@router.post("/upload", status_code=status.HTTP_200_OK)
def upload_image(
    file: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    try:
        # Upload the file bytes directly to AWS S3 and convert to WebP
        upload_result = upload_image_to_s3(
            file.file,
            filename=file.filename or "image.jpg",
            folder="ai_prompt_gallery",
            convert_to_webp=True
        )
        return {
            "image_url": upload_result.get("image_url"),
            "public_id": upload_result.get("key"),
            "key": upload_result.get("key")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 upload failed: {str(e)}"
        )


# ── Category Management (Admin only) ──
@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreateRequest,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    existing = db.query(Category).filter(Category.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )
    new_cat = Category(name=payload.name)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat


@router.delete("/categories/{id}", status_code=status.HTTP_200_OK)
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}


# ── Prompt Management (Admin only) ──
def sanitize_for_filename(text: str, max_len: int = 30) -> str:
    # Remove non-alphanumeric, replace with underscore, limit length
    safe_text = "".join(c if c.isalnum() else "_" for c in text)
    safe_text = re.sub(r"_+", "_", safe_text)
    return safe_text[:max_len].strip("_")


@router.post("/prompts", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(
    payload: PromptCreateRequest,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    # Verify category exists
    cat = db.query(Category).filter(Category.id == payload.category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified category does not exist"
        )
    new_prompt = Prompt(
        image_url=payload.image_url,
        prompt_text=payload.prompt_text,
        category_id=payload.category_id
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    
    # Organize image on S3 to include Category and prompt text
    if new_prompt.image_url:
        safe_cat_name = sanitize_for_filename(cat.name, 20)
        short_prompt = sanitize_for_filename(new_prompt.prompt_text, 30)
        new_s3_key = f"ai_prompt_gallery/{safe_cat_name}/{safe_cat_name}_prompt_{new_prompt.id}_{short_prompt}.webp"
        
        try:
            updated_url = rename_or_move_s3_image(new_prompt.image_url, new_s3_key)
            if updated_url != new_prompt.image_url:
                new_prompt.image_url = updated_url
                db.commit()
        except Exception as e:
            print(f"S3 file organize failed: {e}")

    return new_prompt


@router.put("/prompts/{id}", response_model=PromptResponse)
def update_prompt(
    id: int,
    payload: PromptUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    prompt = db.query(Prompt).filter(Prompt.id == id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    
    cat = None
    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified category does not exist"
            )
        prompt.category_id = payload.category_id

    image_changed = False
    if payload.image_url is not None and payload.image_url != prompt.image_url:
        prompt.image_url = payload.image_url
        image_changed = True
        
    if payload.prompt_text is not None:
        prompt.prompt_text = payload.prompt_text

    db.commit()
    
    # If a new image was uploaded, organize it on S3
    if image_changed:
        cat_for_rename = cat if cat else db.query(Category).filter(Category.id == prompt.category_id).first()
        if cat_for_rename and prompt.image_url:
            safe_cat_name = sanitize_for_filename(cat_for_rename.name, 20)
            short_prompt = sanitize_for_filename(prompt.prompt_text, 30)
            new_s3_key = f"ai_prompt_gallery/{safe_cat_name}/{safe_cat_name}_prompt_{prompt.id}_{short_prompt}.webp"
            
            try:
                updated_url = rename_or_move_s3_image(prompt.image_url, new_s3_key)
                if updated_url != prompt.image_url:
                    prompt.image_url = updated_url
                    db.commit()
            except Exception as e:
                print(f"S3 rename failed during update: {e}")

    db.refresh(prompt)
    return prompt


@router.delete("/prompts/{id}", status_code=status.HTTP_200_OK)
def delete_prompt(
    id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    prompt = db.query(Prompt).filter(Prompt.id == id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    # Remove image from S3 if exists
    if prompt.image_url:
        delete_s3_image(prompt.image_url)
        
    db.delete(prompt)
    db.commit()
    return {"message": "Prompt deleted successfully"}
