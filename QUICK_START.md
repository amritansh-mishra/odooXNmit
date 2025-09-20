# Quick Start Guide - OdooXNmit Integration

## 🚀 Getting Started

This guide will help you quickly set up and test the frontend-backend integration.

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ running
- Git (for cloning)

## Step 1: Database Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE odooxnmit;
   ```

2. **Create Environment File**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit `.env` file with your database credentials:**
   ```env
   MYSQL_DATABASE=odooxnmit
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=localhost
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5001
   FRONTEND_URL=http://localhost:3000
   ```

## Step 2: Backend Setup

```bash
cd backend
npm install
npm run dev
```

**Expected Output:**
```
✅ MySQL connection established successfully.
✅ Sequelize models synchronized successfully.
🚀 Server running in development mode on port 5001
📍 Server URL: http://localhost:5001
🏥 Health check: http://localhost:5001/health
```

## Step 3: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
  VITE v5.4.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 4: Test Integration

1. **Open Browser**: Navigate to http://localhost:3000

2. **Test Authentication**: 
   - The app will show a login form
   - Try logging in (currently uses mock auth with fallback)

3. **Test Data Loading**:
   - Navigate to "Contacts" or "Products"
   - Data should load from backend API
   - Check browser dev tools Network tab for API calls

4. **Test Reports**:
   - Navigate to "Reports"
   - Should show real-time data from backend

## Step 5: Verify API Endpoints

Test these endpoints directly:

```bash
# Health check
curl http://localhost:5001/health

# Get contacts (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/master/contacts

# Get products
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/master/products
```

## Troubleshooting

### Backend Won't Start
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure port 5001 is available

### Frontend Can't Connect to Backend
- Check backend is running on port 5001
- Verify proxy configuration in `vite.config.js`
- Check browser console for CORS errors

### Database Connection Issues
- Verify MySQL service is running
- Check database exists: `SHOW DATABASES;`
- Verify user permissions

### Authentication Issues
- Check JWT_SECRET is set in backend `.env`
- Clear browser localStorage
- Check browser dev tools for token errors

## What's Integrated

✅ **Authentication System**
- JWT-based authentication
- Automatic token management
- Role-based access control

✅ **API Services**
- Centralized API communication
- Error handling and fallbacks
- Loading states

✅ **Data Management**
- Contacts CRUD operations
- Products CRUD operations
- Reports generation

✅ **Error Handling**
- Graceful fallbacks to mock data
- User-friendly error messages
- Console logging for debugging

## Next Steps

1. **Add Real Users**: Create user accounts in the database
2. **Customize Data**: Modify mock data to match your needs
3. **Add Features**: Implement additional CRUD operations
4. **Deploy**: Set up production environment

## Support

- Check `INTEGRATION_DOCUMENTATION.md` for detailed information
- Review console logs for error details
- Check network tab in browser dev tools

Happy coding! 🎉
