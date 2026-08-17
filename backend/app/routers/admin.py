from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
from app.database import get_db
from app.config import settings
from app.models import Admin, Category, Prompt
from app.schemas.models_schema import (
    AdminRegisterRequest, AdminLoginRequest, TokenResponse,
    CategoryCreateRequest, CategoryResponse,
    PromptCreateRequest, PromptResponse, PromptUpdateRequest
)
from app.routers.auth_utils import hash_password, verify_password, create_access_token, get_current_admin

# Initialize Cloudinary configs
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

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


# ── Cloudinary Media Upload API ──
@router.post("/upload", status_code=status.HTTP_200_OK)
def upload_image(
    file: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    try:
        # Upload the file bytes directly to Cloudinary and force convert to WebP
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="ai_prompt_gallery",
            resource_type="image",
            format="webp"  # Forces Cloudinary to convert the image to WebP format
        )
        return {
            "image_url": upload_result.get("secure_url"),
            "public_id": upload_result.get("public_id")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}"
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
import re

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
    
    # Rename image on Cloudinary to include ID and prompt text
    match = re.search(r'/upload/(?:v\d+/)?(ai_prompt_gallery/[^.]+)', new_prompt.image_url)
    if match:
        old_public_id = match.group(1)
        safe_cat_name = sanitize_for_filename(cat.name, 20)
        short_prompt = sanitize_for_filename(new_prompt.prompt_text, 30)
        new_public_id = f"ai_prompt_gallery/{safe_cat_name}/{safe_cat_name}_prompt_{new_prompt.id}_{short_prompt}"
        
        try:
            rename_res = cloudinary.uploader.rename(old_public_id, new_public_id, overwrite=True)
            # Update the display name on Cloudinary dashboard
            try:
                cloudinary.uploader.explicit(new_public_id, type="upload", display_name=short_prompt)
            except Exception as display_err:
                print(f"Failed to update display name on Cloudinary: {display_err}")
            new_prompt.image_url = rename_res.get("secure_url")
            db.commit()
        except Exception as e:
            print(f"Cloudinary rename failed: {e}")

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
    
    # If a new image was uploaded, rename it properly
    if image_changed:
        # We need the category name, fetch it again if we haven't already
        cat_for_rename = cat if 'cat' in locals() and cat else db.query(Category).filter(Category.id == prompt.category_id).first()
        
        match = re.search(r'/upload/(?:v\d+/)?(ai_prompt_gallery/[^.]+)', prompt.image_url)
        if match and cat_for_rename:
            old_public_id = match.group(1)
            safe_cat_name = sanitize_for_filename(cat_for_rename.name, 20)
            short_prompt = sanitize_for_filename(prompt.prompt_text, 30)
            new_public_id = f"ai_prompt_gallery/{safe_cat_name}/{safe_cat_name}_prompt_{prompt.id}_{short_prompt}"
            
            try:
                rename_res = cloudinary.uploader.rename(old_public_id, new_public_id, overwrite=True)
                # Update the display name on Cloudinary dashboard
                try:
                    cloudinary.uploader.explicit(new_public_id, type="upload", display_name=short_prompt)
                except Exception as display_err:
                    print(f"Failed to update display name on Cloudinary during update: {display_err}")
                prompt.image_url = rename_res.get("secure_url")
                db.commit()
            except Exception as e:
                print(f"Cloudinary rename failed during update: {e}")

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
    db.delete(prompt)
    db.commit()
    return {"message": "Prompt deleted successfully"}
