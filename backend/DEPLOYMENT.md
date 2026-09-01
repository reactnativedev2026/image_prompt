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
- `AWS_ACCESS_KEY_ID` = `your_aws_access_key_id`
- `AWS_SECRET_ACCESS_KEY` = `your_aws_secret_access_key`
- `AWS_REGION` = `us-east-1` (or your bucket region)
- `AWS_S3_BUCKET_NAME` = `your_s3_bucket_name`
- `AWS_S3_CUSTOM_DOMAIN` = (optional CDN / CloudFront URL)
- `JWT_SECRET` = `your_jwt_secret_key`

Click **Save Changes**. Render will automatically build, link your Neon DB, and deploy your API!
