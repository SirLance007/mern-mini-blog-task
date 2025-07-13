# BlogVista - MERN Stack Blog Application

A modern, full-stack blog application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring dark theme, authentication, and real-time features.

## Features

### Backend Features
- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Complete user profiles with avatar, bio, and social links
- **Streak Tracking**: Daily contribution tracking with streak counting
- **Badge System**: Earnable badges for user achievements
- **Blog Posts**: Full CRUD operations with rich content support
- **Like System**: Interactive like/unlike functionality
- **View Tracking**: Post view count and history
- **Search Functionality**: Full-text search with MongoDB indexing
- **Trending Algorithm**: Time-based trending score calculation
- **Image Upload**: Cloudinary integration for image hosting
- **Pagination**: Efficient data loading with pagination
- **Rate Limiting**: API protection with rate limiting
- **Security**: Helmet.js for security headers

### Frontend Features
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Dark Theme**: Toggle between light and dark modes
- **Authentication**: Login/Register forms with validation
- **Protected Routes**: Secure access to user-specific features
- **Real-time Updates**: Live like counts and user interactions
- **Responsive Design**: Mobile-first approach
- **Loading States**: Smooth loading experiences
- **Error Handling**: User-friendly error messages

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Vite** - Build tool

## Project Structure

```
blog-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── BlogPost.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── config.env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Loading.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── CreatePostPage.jsx
    │   │   ├── PostDetailPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── TrendingPage.jsx
    │   │   └── SearchPage.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── tailwind.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd blog-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
PORT=3000
FrontendURL=http://localhost:5174
JWT_SECRETKEY=your_jwt_secret_key
mongodb_Cluster=your_mongodb_connection_string
Cloudinary_CloudName=your_cloudinary_cloud_name
Cloudinary_API=your_cloudinary_api_key
Cloudinary_APIsecret=your_cloudinary_api_secret
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd blog-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/stats` - Get user stats

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/search` - Search posts
- `GET /api/posts/user/:userId` - Get user's posts

## Features in Development

- [ ] Advanced search with filters
- [ ] Comment system
- [ ] User following system
- [ ] Email notifications
- [ ] Rich text editor for posts
- [ ] Image upload and management
- [ ] Admin dashboard
- [ ] Analytics and insights
- [ ] Social sharing
- [ ] Newsletter subscription

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@blogvista.com or create an issue in the repository. 