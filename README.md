# AI-Enabled Online Course Registration System

A full-stack web application for course registration with AI chatbot assistance, built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with role-based access control
- **Three user roles**: Student, Faculty, Admin
- Secure login/signup with password hashing

### Student Features
- **Course Registration**: Browse, register, and drop courses
- **Schedule Management**: View weekly schedule with conflict detection
- **AI Recommendations**: Get personalized course suggestions based on GPA, major, and academic progress
- **Schedule Optimization**: AI-powered analysis of course conflicts and workload impact
- **Interactive Chatbot**: Natural language processing for course queries, schedule questions, and academic guidance

### Faculty Features
- **Student Monitoring**: View student course loads and academic progress
- **AI Student Load Analysis**: Detailed analytics on student academic workload, difficulty assessment, and performance predictions
- **Course Analytics**: Track enrollment statistics and popular courses
- **Student Advising**: Review and advise student course selections with AI-powered insights

### Admin Features
- **User Management**: Create, update, and manage user accounts
- **Course Catalog**: Add, edit, and delete courses
- **AI Analytics Dashboard**: Comprehensive analytics including:
  - Course demand forecasting
  - Catalog health monitoring
  - Registration anomaly detection
  - Chatbot usage analytics
- **System Monitoring**: Track enrollments, activity logs, and system performance
- **Role Assignment**: Manage user permissions and roles

### UI/UX Features
- **Modern Design**: Clean, responsive interface with TailwindCSS
- **Accessibility**: High-contrast UI, keyboard navigation, screen-reader friendly
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Dynamic course availability and enrollment status

## 🛠️ Tech Stack

- **Frontend**: React 18, TailwindCSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API
- **HTTP Client**: Axios

## 📋 Prerequisites

- **Node.js (v16 or higher)** - Download from [nodejs.org](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud): [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **npm or yarn package manager**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd course-registration-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/course_registration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup
Start MongoDB service, then seed the database with sample data:
```bash
cd ../backend
node seedData.js
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 Demo Accounts

Use these accounts to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | password123 |
| Faculty | faculty@demo.com | password123 |
| Admin | admin@demo.com | password123 |

Additional student accounts:
- alice@demo.com / password123 (Mathematics major)
- bob@demo.com / password123 (Physics major)

## 📁 Project Structure

```
course-registration-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── courseController.js   # Course management
│   │   ├── chatbotController.js  # AI chatbot responses
│   │   ├── aiController.js       # AI analytics and services
│   │   ├── adminController.js    # Admin operations
│   │   └── facultyController.js  # Faculty operations
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── roleAuth.js          # Role-based authorization
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Course.js            # Course schema
│   │   └── ChatbotLog.js        # Chatbot interaction logs
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── courses.js           # Course routes
│   │   ├── chatbot.js           # Chatbot routes
│   │   ├── ai.js                # AI services routes
│   │   ├── admin.js             # Admin routes
│   │   └── faculty.js           # Faculty routes
│   ├── services/                # AI and analytics services
│   │   ├── aiRecommendationService.js
│   │   ├── anomalyDetectionService.js
│   │   ├── chatbotAnalyticsService.js
│   │   └── enhancedChatbotService.js
│   ├── server.js                # Express server entry point
│   ├── seedData.js              # Database seeding script
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js         # Navigation component
    │   │   ├── CourseCard.js     # Course display component
    │   │   ├── Chatbot.js        # AI chatbot widget
    │   │   ├── AIRecommendations.js # AI course recommendations
    │   │   ├── AdminAnalytics.js # Admin analytics dashboard
    │   │   ├── AnomalyDetection.js # Registration anomaly detection
    │   │   ├── ChatbotAnalytics.js # Chatbot usage analytics
    │   │   └── StudentLoadAnalysis.js # Faculty student analysis
    │   ├── contexts/
    │   │   └── AuthContext.js    # Authentication context
    │   ├── pages/
    │   │   ├── Login.js          # Login page
    │   │   ├── Register.js       # Registration page
    │   │   ├── StudentDashboard.js
    │   │   ├── FacultyDashboard.js
    │   │   ├── AdminDashboard.js
    │   │   ├── CourseCatalog.js  # Course browsing
    │   │   └── MyCourses.js      # Student course management
    │   ├── utils/
    │   │   └── api.js            # API client configuration
    │   ├── App.js                # Main app component
    │   └── index.js              # React entry point
    ├── tailwind.config.js        # TailwindCSS configuration
    └── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/my-courses` - Get student's enrolled courses
- `GET /api/courses/recommendations` - Get AI course recommendations
- `POST /api/courses/:id/register` - Register for a course
- `DELETE /api/courses/:id/drop` - Drop a course

### AI Services
- `GET /api/ai/recommendations` - Get personalized course recommendations
- `POST /api/ai/schedule-optimization` - Analyze schedule optimization
- `GET /api/ai/student-load-analysis/:id` - Get student load analysis
- `GET /api/ai/demand-forecast` - Get course demand forecasting
- `GET /api/ai/catalog-health` - Get catalog health analysis
- `GET /api/ai/anomaly-detection` - Detect registration anomalies
- `GET /api/ai/chatbot-analytics` - Get chatbot usage analytics

### Chatbot
- `POST /api/chatbot/query` - Send message to chatbot
- `GET /api/chatbot/history` - Get chat history

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `GET /api/admin/stats` - Get system statistics

## 🤖 AI Features

### Enhanced Chatbot
The integrated chatbot uses natural language processing and can help with:
- **Schedule Queries**: "Show me my current schedule" or "What courses do I have on Monday?"
- **Course Information**: "What humanities courses are available?" or "Tell me about CS101"
- **Registration Help**: "How do I register for courses?" or "Can I take advanced calculus?"
- **Academic Info**: "What's my current GPA?" or "How many credits am I taking?"
- **Prerequisites**: "What are the prerequisites for Data Structures?"
- **Recommendations**: "Recommend some courses for my major"

### AI Analytics & Insights
- **Personalized Recommendations**: Machine learning-based course suggestions
- **Schedule Optimization**: Conflict detection and workload balancing
- **Anomaly Detection**: Automated detection of unusual registration patterns
- **Predictive Analytics**: Course demand forecasting and capacity planning
- **Student Load Analysis**: Academic workload assessment and performance predictions

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with secure tokens
- **Role-based Access Control**: Granular permissions for different user types
- **Input Validation**: Server-side validation for all API endpoints
- **CORS Protection**: Configured for secure cross-origin requests

## 🎨 UI Components

### Reusable Components
- **Navbar**: Role-based navigation with responsive design
- **CourseCard**: Interactive course display with registration actions
- **Chatbot**: Expandable AI assistant widget
- **Loading States**: Consistent loading indicators
- **Error Handling**: User-friendly error messages

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhanced**: Full-featured desktop experience

## 🚀 Deployment

### Environment Variables
Create production environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/course_registration
JWT_SECRET=your_secure_jwt_secret_for_production
PORT=5000
```

### Build for Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
npm start
```

## 🧪 Testing

### Manual Testing Scenarios
1. **User Registration/Login**: Test all three user roles
2. **Course Registration**: Test enrollment, conflicts, capacity limits
3. **Schedule Management**: Verify weekly schedule display
4. **AI Features**: Test personalized recommendations, schedule optimization
5. **Chatbot Interaction**: Test natural language queries and responses
6. **Admin Analytics**: Test demand forecasting, anomaly detection, chatbot analytics
7. **Faculty Analytics**: Test student load analysis
8. **Responsive Design**: Test on different screen sizes

## 🔧 Development

### Adding New Features
1. **Backend**: Add routes in `/routes`, controllers in `/controllers`
2. **Frontend**: Create components in `/components`, pages in `/pages`
3. **Database**: Update models in `/models` if needed
4. **API**: Add API calls to `/utils/api.js`

### Code Style
- Use ES6+ features
- Follow React hooks patterns
- Implement proper error handling
- Add loading states for async operations
- Use TailwindCSS utility classes

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
1. Check the documentation
2. Review the demo accounts and sample data
3. Test API endpoints using the provided examples
4. Verify MongoDB connection and data seeding

---

**Built with ❤️ using React, Node.js, and MongoDB**
