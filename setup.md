# BlogVista Setup Guide

## Quick Start

### 1. Install Backend Dependencies
```bash
cd New-Blog/blog-app/backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd New-Blog/blog-app/frontend
npm install
```

### 3. Start Backend Server
```bash
cd New-Blog/blog-app/backend
npm run dev
```
The backend will run on http://localhost:3000

### 4. Start Frontend Development Server
```bash
cd New-Blog/blog-app/frontend
npm run dev
```
The frontend will run on http://localhost:5174

## Environment Configuration

The backend is already configured with the environment variables from the README:
- MongoDB connection string
- JWT secret key
- Cloudinary credentials
- CORS settings

## Features Available

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Protected routes

✅ **Blog Features**
- Create, read, update, delete posts
- Like/unlike posts
- View count tracking
- Search functionality
- Trending posts

✅ **User Features**
- User profiles with avatars
- Streak tracking system
- Badge system
- User statistics

✅ **UI/UX**
- Modern responsive design
- Dark/light theme toggle
- Mobile-friendly interface
- Loading states and error handling

## Next Steps

1. **Test the Application**
   - Register a new account
   - Create your first blog post
   - Explore the features

2. **Customize**
   - Modify the styling in `src/index.css`
   - Add new components in `src/components/`
   - Extend the API in `backend/controllers/`

3. **Deploy**
   - Backend: Deploy to Heroku, Railway, or Vercel
   - Frontend: Deploy to Vercel, Netlify, or GitHub Pages

## Troubleshooting

If you encounter any issues:

1. **Port conflicts**: Change the port in `vite.config.js` or `server.js`
2. **MongoDB connection**: Verify your MongoDB Atlas connection string
3. **CORS issues**: Check the `FrontendURL` in `config.env`

## Support

For issues or questions, check the main README.md file for detailed documentation. 