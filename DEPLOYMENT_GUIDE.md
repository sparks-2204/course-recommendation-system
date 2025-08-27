# 🚀 Deployment Guide

## Frontend Deployment (Netlify)

### Option 1: Netlify CLI (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Option 2: Netlify Web Interface
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Connect your repository
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: `frontend`

## Backend Deployment Options

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from backend directory
cd backend
railway deploy
```

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

### Option 3: Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git subtree push --prefix backend heroku main
```

## Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Update environment variables

## Environment Variables for Production

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/course-registration
JWT_SECRET=your-super-secure-jwt-secret-for-production
```

### Frontend (if needed)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## Quick Deploy Commands

### Frontend to Netlify
```bash
cd frontend
npm run build
npx netlify-cli deploy --prod --dir=build
```

### Backend to Railway
```bash
cd backend
npx @railway/cli deploy
```

## Post-Deployment Steps

1. **Update API URL**: Update frontend to point to deployed backend
2. **Test all features**: Login, registration, course management
3. **Test AI Features**: 
   - Personalized course recommendations
   - Schedule optimization
   - Chatbot functionality
   - Admin analytics dashboards
   - Anomaly detection
   - Student load analysis
4. **Check CORS**: Ensure backend allows frontend domain
5. **Monitor logs**: Check for any deployment issues
6. **Set up custom domain** (optional)
7. **Seed database**: Run `node seedData.js` on production database

## Troubleshooting

### Common Issues
- **CORS errors**: Add frontend URL to CORS whitelist
- **Environment variables**: Double-check all are set correctly
- **Build failures**: Check Node.js version compatibility
- **Database connection**: Verify MongoDB Atlas connection string
- **AI Services errors**: Ensure all AI service dependencies are available
- **Chatbot logging**: Verify ChatbotLog model is properly created in database

### Frontend Issues
- Clear browser cache
- Check console for JavaScript errors
- Verify API endpoints are correct

### Backend Issues
- Check server logs
- Verify all dependencies are installed
- Test database connection

## Monitoring & Maintenance

### Health Checks
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor database performance
- Check error logs regularly

### Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Regular backups of database

## Cost Optimization

### Free Tiers Available
- **Netlify**: 100GB bandwidth, 300 build minutes
- **Railway**: $5 credit monthly
- **MongoDB Atlas**: 512MB storage
- **Render**: 750 hours/month

### Scaling Considerations
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Consider serverless functions for API
