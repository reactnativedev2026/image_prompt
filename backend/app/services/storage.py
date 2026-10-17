import io
from ..config import settings
from .s3 import upload_image_to_s3, rename_or_move_s3_image, delete_s3_image
# from app.services.cloudinary_service import upload_image_to_cloudinary, rename_or_move_cloudinary_image, delete_cloudinary_image
from .local_backup import save_local_image_backup, organize_local_backup

def upload_image(file_obj, filename: str = "", folder: str = "ai_prompt_gallery") -> dict:
    """
    Uploads image to primary cloud storage (Cloudinary / S3) 
    AND simultaneously saves a local WebP backup on the backend server.
    """
    # 1. Read file bytes so we can use them for both local backup and cloud upload
    if hasattr(file_obj, "read"):
        file_bytes = file_obj.read()
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)
    elif isinstance(file_obj, bytes):
        file_bytes = file_obj
    else:
        file_bytes = b""

    # 2. Upload to primary cloud provider (Cloudinary or S3)
    provider = getattr(settings, "STORAGE_PROVIDER", "s3").lower()
    if provider == "s3":
        upload_result = upload_image_to_s3(io.BytesIO(file_bytes), filename=filename, folder=folder, convert_to_webp=True)
    else:
        # Cloudinary support disabled; placeholder result
        upload_result = {"url": "", "key": f"{folder}/{filename}"}

    # 3. Always save local server disk backup
    backup_key = upload_result.get("key") or upload_result.get("public_id") or f"{folder}/{filename}"
    if file_bytes:
        save_local_image_backup(file_bytes, backup_key)

    return upload_result

def rename_or_move_image(old_url_or_key: str, new_identifier: str) -> str:
    """
    Renames/organizes image in primary cloud storage 
    AND simultaneously organizes the local server disk backup.
    """
    # 1. Organize local server backup
    organize_local_backup(old_url_or_key, new_identifier)

    # 2. Organize in cloud storage
    if "amazonaws.com" in old_url_or_key or old_url_or_key.startswith("ai_prompt_gallery/"):
        return rename_or_move_s3_image(old_url_or_key, new_identifier)
        
    provider = getattr(settings, "STORAGE_PROVIDER", "s3").lower()
    if provider == "s3":
        return rename_or_move_s3_image(old_url_or_key, new_identifier)
    return old_url_or_key

def delete_image(url_or_key: str) -> bool:
    """Deletes image from cloud storage provider."""
    if not url_or_key:
        return False
        
    if "amazonaws.com" in url_or_key:
        return delete_s3_image(url_or_key)
        
    provider = getattr(settings, "STORAGE_PROVIDER", "s3").lower()
    if provider == "s3":
        return delete_s3_image(url_or_key)
    return False
