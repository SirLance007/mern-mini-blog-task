# Frontend Deployment Guide for Render

## Prerequisites
- Your backend is already deployed at: https://mern-mini-blog-task.onrender.com
- You have a GitHub repository with your frontend code

## Steps to Deploy Frontend to Render

### 1. Prepare Your Repository
Make sure your frontend code is pushed to GitHub with the following structure:
```
frontend/
├── package.json
├── vite.config.js
├── src/
│   ├── utils/
│   │   └── config.js (newly created)
│   ├── context/
│   ├── pages/
│   └── components/
└── render.yaml (newly created)
```

### 2. Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Sign in or create an account

2. **Create New Static Site**
   - Click "New +" button
   - Select "Static Site"

3. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Choose the branch (usually `main` or `master`)

4. **Configure Build Settings**
   - **Name**: `blog-app-frontend` (or any name you prefer)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**:
     - Key: `VITE_BACKEND_URL`
     - Value: `https://mern-mini-blog-task.onrender.com`

5. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your site

### 3. Alternative: Use render.yaml (Recommended)

If you have the `render.yaml` file in your repository:

1. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your repository

3. **Render will automatically detect the render.yaml file**
   - It will use the configuration from the file
   - Environment variables will be set automatically

### 4. Verify Deployment

After deployment:
1. Your site will be available at: `https://your-app-name.onrender.com`
2. Test the following features:
   - User registration/login
   - Creating posts
   - Liking/saving posts
   - Searching posts
   - Profile management

### 5. Troubleshooting

**Common Issues:**

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (use Node 16+)

2. **API Calls Fail**
   - Verify `VITE_BACKEND_URL` environment variable is set correctly
   - Check that your backend is running and accessible

3. **CORS Issues**
   - Your backend should already handle CORS for the frontend domain
   - If issues persist, check backend CORS configuration

4. **Environment Variables Not Working**
   - Make sure the environment variable name starts with `VITE_`
   - Rebuild the application after adding environment variables

### 6. Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your site settings in Render
   - Click "Custom Domains"
   - Add your domain

2. **Update Backend CORS**
   - Update your backend CORS settings to include your custom domain

## Files Modified for Deployment

The following files were updated to support production deployment:

1. **frontend/src/utils/config.js** - New file for API URL configuration
2. **frontend/vite.config.js** - Updated to use environment variables
3. **All React components** - Updated to use the config utility instead of hardcoded URLs
4. **frontend/render.yaml** - Render deployment configuration

## Environment Variables

- `VITE_BACKEND_URL`: Your backend URL (https://mern-mini-blog-task.onrender.com)

## Notes

- The frontend will automatically use the production backend URL when deployed
- Local development will still use localhost:3000 for the backend
- All API calls now use the centralized configuration from `utils/config.js` 