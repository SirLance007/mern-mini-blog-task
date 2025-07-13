# BlogVista - MERN Stack Blog Application

A modern, full-featured blog application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, post creation, trending posts, and a beautiful responsive UI.

## Features

### 🚀 Core Features
- **User Authentication**: Secure login/register with JWT tokens
- **Blog Post Management**: Create, edit, delete posts with rich content
- **Trending Posts**: Algorithm-based trending system with time filters
- **Category Filtering**: Filter posts by categories
- **Like System**: Interactive like/unlike functionality
- **View Tracking**: Post view count tracking
- **Reading Time**: Automatic reading time calculation
- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: Toggle between light and dark themes
- **Toast Notifications**: Beautiful toast notifications for user feedback

### 🎨 UI/UX Features
- **Modern Design**: Clean, modern interface with gradients and shadows
- **Animations**: Smooth animations using Framer Motion
- **Loading States**: Beautiful loading spinners and skeletons
- **Form Validation**: Real-time form validation with error messages
- **Preview Mode**: Live preview when creating posts
- **Image Support**: Featured images for posts
- **Tag System**: Categorize posts with tags

### 🔧 Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Server-side validation with express-validator
- **Error Handling**: Comprehensive error handling
- **Rate Limiting**: API rate limiting for security
- **CORS Support**: Cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blog-app
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment configuration:
```bash
# Create config.env file
touch config.env
```

Add the following to your `config.env`:
```env
PORT=3000
mongodb_Cluster=mongodb://localhost:27017/blogvista
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

### 4. Database Setup

Start MongoDB (if using local installation):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Seed the Database

From the backend directory, run the seed script to populate the database with sample data:
```bash
npm run seed
```

This will create:
- 3 sample users (john@example.com, sarah@example.com, mike@example.com)
- 5 sample blog posts across different categories
- All passwords are set to "password123"

### 6. Start the Application

#### Start Backend Server
From the backend directory:
```bash
npm run dev
```
The backend will start on `http://localhost:3000`

#### Start Frontend Development Server
From the frontend directory:
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

## Usage

### 1. Register/Login
- Visit `http://localhost:5173`
- Click "Sign up" to create a new account
- Or use the sample accounts:
  - Email: `john@example.com`, Password: `password123`
  - Email: `sarah@example.com`, Password: `password123`
  - Email: `mike@example.com`, Password: `password123`

### 2. Explore Posts
- Browse the home page to see all posts
- Use category filters to find specific content
- Click on posts to read the full content
- Like posts to show appreciation

### 3. Create Posts
- Click "Create Post" button (requires login)
- Fill in the form with your content
- Use the preview feature to see how your post will look
- Choose between draft and published status
- Add tags and categories for better organization

### 4. Trending Posts
- Visit the "Trending" page to see popular posts
- Filter by time periods (Today, This Week, This Month)
- Sort by different criteria (Trending Score, Most Liked, etc.)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/search` - Search posts

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## Project Structure

```
blog-app/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── BlogPost.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── config.env
│   ├── package.json
│   ├── seedData.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Loading.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── CreatePostPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── TrendingPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
└── README.md
```

## Customization

### Adding New Categories
1. Update the categories array in `CreatePostPage.jsx`
2. Add validation in backend routes
3. Update the BlogPost model if needed

### Styling
- The app uses Tailwind CSS for styling
- Dark mode is implemented with CSS classes
- Animations use Framer Motion
- Custom colors can be added to `tailwind.config.js`

### Environment Variables
- `PORT`: Backend server port (default: 3000)
- `mongodb_Cluster`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `NODE_ENV`: Environment mode

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `config.env`
   - For Atlas, ensure your IP is whitelisted

2. **Port Already in Use**
   - Change the PORT in `config.env`
   - Kill processes using the port: `npx kill-port 3000`

3. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for missing dependencies

4. **Authentication Issues**
   - Ensure JWT_SECRET is set in `config.env`
   - Check that tokens are being sent in requests

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading
2. **API Testing**: Use Postman or similar tools to test API endpoints
3. **Database**: Use MongoDB Compass for database visualization
4. **Logs**: Check console logs for detailed error information

## Deployment

### Backend Deployment (Vercel/Heroku)
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas is configured
3. Deploy using your platform's deployment method

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Happy Blogging! 🚀** 