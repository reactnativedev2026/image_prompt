from pydantic import BaseModel, Field

class AdminRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)

class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class PromptCreateRequest(BaseModel):
    image_url: str
    prompt_text: str = Field(..., min_length=5)
    category_id: int

class PromptUpdateRequest(BaseModel):
    image_url: str | None = None
    prompt_text: str | None = None
    category_id: int | None = None

class PromptResponse(BaseModel):
    id: int
    image_url: str
    prompt_text: str
    view_count: int
    category_id: int

    class Config:
        from_attributes = True
