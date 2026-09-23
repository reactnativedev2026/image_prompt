import re
import io
import uuid
try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    HAS_CLOUDINARY = True
except ImportError:
    HAS_CLOUDINARY = False
from app.config import settings

def configure_cloudinary():
    """Initializes Cloudinary credentials from settings."""
    if not HAS_CLOUDINARY:
        raise ImportError("The 'cloudinary' package is not installed. Please run: pip install cloudinary")
    if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_API_SECRET:
        raise ValueError("Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in .env")
    
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME.strip(),
        api_key=settings.CLOUDINARY_API_KEY.strip(),
        api_secret=settings.CLOUDINARY_API_SECRET.strip(),
        secure=True
    )

def extract_public_id_from_url(url: str) -> str:
    """Extracts Cloudinary public_id from full Cloudinary URL."""
    if not url:
        return ""
    # Example: https://res.cloudinary.com/demo/image/upload/v1234567890/ai_prompt_gallery/sample.webp
    match = re.search(r"/upload/(?:v\d+/)?(ai_prompt_gallery/[^.]+)", url)
    if match:
        return match.group(1)
    
    # Fallback to key without extension if contains ai_prompt_gallery
    match2 = re.search(r"(ai_prompt_gallery/[^.]+)", url)
    if match2:
        return match2.group(1)
    
    return url

def upload_image_to_cloudinary(file_obj, filename: str = "", folder: str = "ai_prompt_gallery") -> dict:
    """
    Uploads an image file to Cloudinary with WebP optimization.
    Returns {"image_url": str, "public_id": str, "key": str}.
    """
    configure_cloudinary()
    
    # Read bytes if needed or pass directly
    if hasattr(file_obj, "read"):
        file_bytes = file_obj.read()
        # Reset file pointer if possible
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)
        upload_source = io.BytesIO(file_bytes)
    else:
        upload_source = file_obj

    unique_id = uuid.uuid4().hex[:12]
    
    upload_result = cloudinary.uploader.upload(
        upload_source,
        folder=folder,
        public_id=f"temp_{unique_id}",
        resource_type="image",
        format="webp",
        quality="auto:good"
    )
    
    secure_url = upload_result.get("secure_url") or upload_result.get("url")
    public_id = upload_result.get("public_id")
    
    return {
        "image_url": secure_url,
        "public_id": public_id,
        "key": public_id
    }

def rename_or_move_cloudinary_image(old_url_or_id: str, new_public_id: str) -> str:
    """
    Renames/organizes an image in Cloudinary.
    Returns updated secure_url.
    """
    configure_cloudinary()
    old_id = extract_public_id_from_url(old_url_or_id)
    if not old_id or old_id == new_public_id:
        return old_url_or_id
        
    try:
        res = cloudinary.uploader.rename(
            from_public_id=old_id,
            to_public_id=new_public_id,
            overwrite=True
        )
        return res.get("secure_url") or old_url_or_id
    except Exception as e:
        print(f"Cloudinary rename failed ({old_id} -> {new_public_id}): {e}")
        return old_url_or_id

def delete_cloudinary_image(url_or_id: str) -> bool:
    """Deletes an image from Cloudinary."""
    if not url_or_id:
        return False
    configure_cloudinary()
    public_id = extract_public_id_from_url(url_or_id)
    if not public_id:
        return False
    try:
        res = cloudinary.uploader.destroy(public_id)
        return res.get("result") == "ok"
    except Exception as e:
        print(f"Failed to delete Cloudinary image ({public_id}): {e}")
        return False
