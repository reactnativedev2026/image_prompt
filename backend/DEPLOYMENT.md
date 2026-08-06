# AI Prompt Gallery - Python Backend Deployment Guide for Render

This backend is ready to be deployed on **Render** (render.com). Follow these step-by-step instructions to deploy:

## 1. Create Git Repository & Push
If you haven't pushed this code to GitHub/GitLab, create a repository and push it:
```bash
git init
git add .
git commit -m "feat: setup python backend with neon db"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 2. Deploy on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub/GitLab repository.
4. Set the following settings:
   - **Name**: `ai-prompt-gallery-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: `backend` (⚠️ Very Important: this directs Render to only build the backend folder)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 3. Configure Environment Variables on Render
Click on the **Environment** tab inside your Render Web Service dashboard and add the following keys:
- `DATABASE_URL` = `your_neon_postgresql_url`
- `CLOUDINARY_CLOUD_NAME` = `your_cloudinary_cloud_name`
- `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
- `CLOUDINARY_API_SECRET` = `your_cloudinary_api_secret`
- `JWT_SECRET` = `your_jwt_secret_key`

Click **Save Changes**. Render will automatically build, link your Neon DB, and deploy your API!
