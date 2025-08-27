# 💻 Local Development Setup

## Prerequisites Installation

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB
Choose one option:

#### Option A: MongoDB Atlas (Cloud - Recommended)
- Go to [mongodb.com/atlas](https://mongodb.com/atlas)
- Create free account and cluster
- Get connection string

#### Option B: Local MongoDB
- Download from [mongodb.com/try/download/community](https://mongodb.com/try/download/community)
- Install and start MongoDB service

## Project Setup

### 1. Navigate to Project Directory
```bash
cd C:\Users\DELL\CascadeProjects\course-registration-system
```

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env example or create new)
# Add these variables:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/course-registration
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development

# Seed the database with sample data
node seedData.js
```

### 3. Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Optional: Create .env file for custom API URL
# REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend Server
```bash
# In backend directory
cd backend
npm run dev
```
✅ Backend will run on: http://localhost:5000

### Start Frontend Server (New Terminal)
```bash
# In frontend directory
cd frontend
npm start
```
✅ Frontend will run on: http://localhost:3000

## Demo Accounts

Use these accounts to test the application:

**Student Account:**
- Email: `john.student@university.edu`
- Password: `password123`

**Faculty Account:**
- Email: `jane.faculty@university.edu`
- Password: `password123`

**Admin Account:**
- Email: `admin@university.edu`
- Password: `password123`

## Testing Features

### ✨ UI/UX Features to Test
- [ ] Dark/Light mode toggle (top-right navbar)
- [ ] Responsive design (resize browser window)
- [ ] Smooth animations and hover effects
- [ ] Toast notifications (try login/logout)
- [ ] Loading states (refresh pages)
- [ ] Mobile navigation menu

### 🔐 Authentication Features
- [ ] Register new account
- [ ] Login with demo accounts
- [ ] Role-based dashboard access
- [ ] Logout functionality

### 📚 Course Management
- [ ] Browse course catalog
- [ ] Register for courses (Student)
- [ ] Drop courses (Student)
- [ ] View enrolled courses
- [ ] Course recommendations

### 🤖 AI Features
- [ ] Chatbot widget (bottom-right)
- [ ] Ask course-related questions
- [ ] Get intelligent responses
- [ ] Personalized course recommendations (Student Dashboard)
- [ ] Schedule optimization analysis
- [ ] Student load analysis (Faculty Dashboard)
- [ ] Course demand forecasting (Admin Dashboard)
- [ ] Catalog health monitoring (Admin Dashboard)
- [ ] Registration anomaly detection (Admin Dashboard)
- [ ] Chatbot usage analytics (Admin Dashboard)

### 👨‍💼 Admin Features (Admin account)
- [ ] User management
- [ ] Course creation/editing
- [ ] System analytics
- [ ] Role management

## Troubleshooting

### Common Issues

**"npm is not recognized"**
- Node.js not installed or not in PATH
- Restart command prompt after installation

**"Cannot connect to MongoDB"**
- Check if MongoDB service is running
- Verify MONGODB_URI in .env file
- For Atlas: check network access settings

**"Port already in use"**
- Kill existing processes:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

**Frontend not loading**
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors
- Ensure backend is running first

**CSS not compiling**
- Delete node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Development Tips

**Hot Reload**
- Both frontend and backend support hot reload
- Changes will automatically refresh

**Database Reset**
- Run `node seedData.js` to reset sample data
- Or manually clear MongoDB collections

**API Testing**
- Backend API available at: http://localhost:5000/api
- Test endpoints with Postman or browser

## Project Structure

```
course-registration-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API logic (includes aiController.js)
│   ├── middleware/      # Authentication & validation
│   ├── models/         # Database schemas (includes ChatbotLog.js)
│   ├── routes/         # API routes (includes ai.js routes)
│   ├── services/       # AI & Analytics services
│   │   ├── aiRecommendationService.js
│   │   ├── anomalyDetectionService.js
│   │   ├── chatbotAnalyticsService.js
│   │   └── enhancedChatbotService.js
│   ├── server.js       # Main server file
│   └── seedData.js     # Sample data script
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   │   ├── AIRecommendations.js
│   │   │   ├── AdminAnalytics.js
│   │   │   ├── AnomalyDetection.js
│   │   │   ├── ChatbotAnalytics.js
│   │   │   └── StudentLoadAnalysis.js
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utilities (includes aiAPI)
│   │   └── App.js      # Main app component
│   └── package.json
└── README.md
```

## Next Steps

1. **Explore the UI**: Test all the enhanced features
2. **Try Different Roles**: Login as Student, Faculty, Admin
3. **Test Mobile**: Resize browser or use mobile device
4. **Customize**: Modify colors, add features
5. **Deploy**: Follow QUICK_DEPLOY.md when ready

## Development Commands

```bash
# Backend
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start production mode
npm run seed     # Populate sample data

# Frontend  
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

Happy coding! 🚀
