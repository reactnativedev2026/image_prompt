import os
import io
import shutil
import re
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA_BACKUP_DIR = os.path.join(BASE_DIR, "media_backup")

def get_backup_dir() -> str:
    """Returns the base local media backup directory and ensures it exists."""
    os.makedirs(MEDIA_BACKUP_DIR, exist_ok=True)
    return MEDIA_BACKUP_DIR

def clean_key_path(key: str) -> str:
    """Normalizes key to relative filesystem path."""
    clean = key.replace("\\", "/").lstrip("/")
    if not clean.endswith(".webp") and not os.path.splitext(clean)[1]:
        clean = f"{clean}.webp"
    return clean

def save_local_image_backup(file_bytes: bytes, relative_key: str) -> str:
    """
    Saves a local backup of the uploaded image on the server disk in WebP format.
    """
    try:
        backup_base = get_backup_dir()
        rel_path = clean_key_path(relative_key)
        full_dest_path = os.path.join(backup_base, rel_path)
        
        # Create parent directory if doesn't exist
        os.makedirs(os.path.dirname(full_dest_path), exist_ok=True)

        # Convert to WebP and save
        try:
            image = Image.open(io.BytesIO(file_bytes))
            if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
                pass
            elif image.mode != "RGB":
                image = image.convert("RGB")
                
            image.save(full_dest_path, format="WEBP", quality=90, optimize=True)
        except Exception:
            # Fallback to direct bytes write if PIL fails
            with open(full_dest_path, "wb") as f:
                f.write(file_bytes)
                
        print(f"[LOCAL BACKUP] Image saved locally to: {full_dest_path}")
        return full_dest_path
    except Exception as e:
        print(f"[LOCAL BACKUP ERROR] Failed to save local copy: {e}")
        return ""

def organize_local_backup(old_key_or_url: str, new_key: str):
    """
    Renames/organizes the local backup image to match the organized prompt category structure.
    """
    try:
        backup_base = get_backup_dir()
        
        # Extract relative path from key or URL
        match = re.search(r"(ai_prompt_gallery/.+)", old_key_or_url)
        old_rel = match.group(1) if match else old_key_or_url.lstrip("/")
        old_rel = clean_key_path(old_rel)
        new_rel = clean_key_path(new_key)
        
        old_full = os.path.join(backup_base, old_rel)
        new_full = os.path.join(backup_base, new_rel)
        
        if os.path.exists(old_full):
            os.makedirs(os.path.dirname(new_full), exist_ok=True)
            shutil.copy2(old_full, new_full)
            print(f"[LOCAL BACKUP] Organized local backup: {new_full}")
    except Exception as e:
        print(f"[LOCAL BACKUP ERROR] Failed to organize local file: {e}")
