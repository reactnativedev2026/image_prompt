import boto3
import io
import uuid
import re
from PIL import Image
from botocore.exceptions import ClientError
from app.config import settings

def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

def get_base_custom_domain() -> str:
    """Returns normalized CDN / Custom domain if set, e.g. https://d123.cloudfront.net"""
    custom = (settings.AWS_S3_CUSTOM_DOMAIN or "").strip().rstrip("/")
    if custom:
        if not custom.startswith("http://") and not custom.startswith("https://"):
            custom = f"https://{custom}"
    return custom

def get_s3_url(key: str) -> str:
    """Generates the public URL for a given S3 key (uses CDN if configured)."""
    custom_domain = get_base_custom_domain()
    clean_key = key.lstrip("/")
    
    if custom_domain:
        return f"{custom_domain}/{clean_key}"
    
    if settings.AWS_REGION and settings.AWS_REGION != "us-east-1":
        return f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{clean_key}"
    return f"https://{settings.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/{clean_key}"

def extract_key_from_url(url: str) -> str:
    """Extracts S3 object key from any URL (CDN, direct S3, or relative path)."""
    if not url:
        return ""
        
    custom_domain = get_base_custom_domain()
    if custom_domain and url.startswith(custom_domain):
        return url[len(custom_domain):].lstrip("/")
    
    # Check for match on any S3 endpoint patterns
    pattern = rf"https://{re.escape(settings.AWS_S3_BUCKET_NAME)}\.s3[.-][^/]+/(.+)"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
        
    pattern2 = rf"https://s3[.-][^/]+/{re.escape(settings.AWS_S3_BUCKET_NAME)}/(.+)"
    match2 = re.search(pattern2, url)
    if match2:
        return match2.group(1)
        
    # Match any CloudFront or custom domain path containing ai_prompt_gallery
    match3 = re.search(r"(ai_prompt_gallery/.+)", url)
    if match3:
        return match3.group(1)
        
    return url.lstrip("/")

def normalize_image_url(url: str) -> str:
    """
    Transforms an image URL according to current CDN / S3 config.
    If CDN is added later, old S3 URLs in database are served via CDN automatically.
    """
    if not url:
        return url
    key = extract_key_from_url(url)
    if key and key.startswith("ai_prompt_gallery/"):
        return get_s3_url(key)
    return url

def upload_image_to_s3(file_obj, filename: str = "", folder: str = "ai_prompt_gallery", convert_to_webp: bool = True) -> dict:
    """
    Reads image file, converts to WebP if enabled, and uploads to AWS S3.
    Returns {"image_url": str, "key": str}.
    """
    if not settings.AWS_S3_BUCKET_NAME:
        raise ValueError("AWS_S3_BUCKET_NAME is not configured in environment variables.")

    raw_bytes = file_obj.read()
    
    if convert_to_webp:
        try:
            image = Image.open(io.BytesIO(raw_bytes))
            # Convert modes if necessary for webp compatibility
            if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
                pass
            elif image.mode != "RGB":
                image = image.convert("RGB")
            
            output_buffer = io.BytesIO()
            image.save(output_buffer, format="WEBP", quality=85, optimize=True)
            upload_bytes = output_buffer.getvalue()
            content_type = "image/webp"
            ext = ".webp"
        except Exception:
            # Fallback to original bytes if conversion fails
            upload_bytes = raw_bytes
            content_type = "image/jpeg"
            ext = ".jpg"
    else:
        upload_bytes = raw_bytes
        content_type = "application/octet-stream"
        ext = ""

    unique_id = uuid.uuid4().hex[:12]
    s3_key = f"{folder}/temp_{unique_id}{ext}"

    s3_client = get_s3_client()
    s3_client.put_object(
        Bucket=settings.AWS_S3_BUCKET_NAME,
        Key=s3_key,
        Body=upload_bytes,
        ContentType=content_type
    )

    image_url = get_s3_url(s3_key)
    return {
        "image_url": image_url,
        "key": s3_key
    }

def rename_or_move_s3_image(old_url_or_key: str, new_key: str) -> str:
    """
    Copies object from old key to new key and removes old key.
    Returns the new image URL (via CDN if configured).
    """
    old_key = extract_key_from_url(old_url_or_key)
    if not old_key or old_key == new_key:
        return old_url_or_key

    s3_client = get_s3_client()
    copy_source = {'Bucket': settings.AWS_S3_BUCKET_NAME, 'Key': old_key}

    try:
        s3_client.copy_object(
            CopySource=copy_source,
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=new_key,
            ContentType="image/webp"
        )
        s3_client.delete_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=old_key)
        return get_s3_url(new_key)
    except Exception as e:
        print(f"S3 move failed ({old_key} -> {new_key}): {e}")
        return old_url_or_key

def delete_s3_image(url_or_key: str) -> bool:
    """Deletes an image from S3 if it belongs to our bucket folder."""
    if not url_or_key:
        return False
    key = extract_key_from_url(url_or_key)
    if not key or not key.startswith("ai_prompt_gallery/"):
        return False
    try:
        s3_client = get_s3_client()
        s3_client.delete_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=key)
        return True
    except Exception as e:
        print(f"Failed to delete S3 image ({key}): {e}")
        return False
