# 🚀 Complete Setup Guide

## Step 1: Install Prerequisites

### Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for stability)
3. Run the installer and follow the setup wizard
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your command prompt/PowerShell
6. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install MongoDB
Choose one option:

#### Option A: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update `backend/.env` with your Atlas connection string

#### Option B: Local MongoDB Installation
1. Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server
3. Install and start the MongoDB service
4. MongoDB will run on `mongodb://localhost:27017` by default

## Step 2: Project Setup

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Step 3: Environment Configuration

### Backend Environment (.env)
Make sure your `backend/.env` file contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/course-registration
# OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/course-registration
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

## Step 4: Database Seeding

Run the seed script to populate sample data:
```bash
cd backend
node seedData.js
```

## Step 5: Start the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### Start Frontend Server (New Terminal)
```bash
cd frontend
npm start
```
Frontend will run on: http://localhost:3000

## Step 6: Test the Application

### Demo Accounts
Use these accounts to test different roles:

**Student Account:**
- Email: `john.student@university.edu`
- Password: `password123`

**Faculty Account:**
- Email: `jane.faculty@university.edu`
- Password: `password123`

**Admin Account:**
- Email: `admin@university.edu`
- Password: `password123`

### Testing Checklist

#### Authentication & Navigation
- [ ] Register new account
- [ ] Login with demo accounts
- [ ] Navigate between pages
- [ ] Test dark mode toggle
- [ ] Test mobile responsive design
- [ ] Logout functionality

#### Student Features
- [ ] View dashboard with enrolled courses
- [ ] Browse course catalog
- [ ] Register for courses
- [ ] Drop courses
- [ ] View course recommendations
- [ ] Use chatbot for queries

#### Faculty Features
- [ ] View faculty dashboard
- [ ] See student analytics
- [ ] View course enrollments
- [ ] Access student details

#### Admin Features
- [ ] View system statistics
- [ ] Manage users (view, update roles)
- [ ] Manage courses (create, edit, delete)
- [ ] View enrollment analytics

#### UI/UX Features
- [ ] Smooth animations and transitions
- [ ] Loading states and skeletons
- [ ] Toast notifications
- [ ] Responsive mobile design
- [ ] Dark/light mode switching
- [ ] Accessibility features

## Troubleshooting

### Common Issues

**"npm is not recognized"**
- Node.js is not installed or not in PATH
- Restart command prompt after Node.js installation

**"Cannot connect to MongoDB"**
- Check if MongoDB service is running (local installation)
- Verify connection string in .env file
- Check network connectivity (Atlas)

**"Port already in use"**
- Another application is using port 3000 or 5000
- Kill the process or use different ports

**Frontend not loading properly**
- Clear browser cache
- Check browser console for errors
- Ensure backend is running first

### Performance Tips
- Use MongoDB Atlas for better performance
- Enable MongoDB indexing for large datasets
- Optimize images and assets
- Use React DevTools for debugging

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### Build Commands
```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## Features Overview

### ✨ Enhanced UI/UX
- Modern glassmorphism design
- Smooth animations and micro-interactions
- Advanced loading states with skeletons
- Toast notification system
- Dark mode support
- Mobile-first responsive design
- Touch-friendly interactions

### 📊 Analytics & Visualization
- Interactive charts and graphs
- Real-time statistics
- Student performance tracking
- Course enrollment analytics
- System usage metrics

### 🔒 Security Features
- JWT authentication
- Role-based access control
- Input validation
- Password hashing
- CORS protection

### 🤖 AI Integration
- Intelligent chatbot
- Course recommendations
- Smart scheduling
- Conflict detection

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Check browser console for errors
5. Review server logs for backend issues

Happy coding! 🎉
