# Frontend-Backend Integration Documentation

## Overview

This document provides a comprehensive guide to the integration between the React frontend and Node.js backend of the OdooXNmit application. The integration follows modern web development practices with proper separation of concerns, error handling, and authentication.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                     │
│                         Port: 3000                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Components  │  │   Hooks     │  │  Services   │            │
│  │             │  │  (useAuth)  │  │   Layer     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                │                   │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐  │
│  │              Vite Proxy (/api → :5001)                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)                 │
│                         Port: 5001                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Routes    │  │ Controllers │  │   Models    │            │
│  │   Layer     │  │   Layer     │  │   Layer     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                │                   │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐  │
│  │              MySQL Database (Sequelize)                │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Data Flow:
1. User Action → Component → Service → API Call
2. Backend Route → Controller → Model → Database
3. Response ← Database ← Model ← Controller ← Route
4. Frontend ← Service ← Component ← User Interface
```

## Integration Points

### 1. API Communication

The frontend communicates with the backend through a centralized API service layer located in `frontend/src/services/`.

#### Base API Service (`api.js`)
- Centralized HTTP client using fetch API
- Automatic token management
- Error handling and response parsing
- Request/response interceptors

```javascript
// Example usage
import apiService from '../services/api';

// GET request
const data = await apiService.get('/master/contacts');

// POST request
const result = await apiService.post('/master/contacts', contactData);
```

#### Service Modules
- `authService.js` - Authentication operations
- `contactsService.js` - Contact management
- `productsService.js` - Product management
- `reportsService.js` - Report generation

### 2. Authentication Integration

#### Frontend Authentication Flow
1. User login triggers `authService.login()`
2. JWT token stored in localStorage
3. Token automatically included in subsequent requests
4. Token validation on app initialization

#### Backend Authentication
- JWT-based authentication
- Protected routes using `requireAuth` middleware
- Role-based access control with `requireRole` middleware

```javascript
// Frontend login
const { login } = useAuth();
await login(loginId, password);

// Backend protected route
router.get('/contacts', requireAuth, listContacts);
```

### 3. Data Flow

#### Contact Management Example
1. **Frontend**: `ContactMaster` component loads contacts
2. **Service**: `contactsService.getContacts()` makes API call
3. **Backend**: `/api/master/contacts` route processes request
4. **Controller**: `contactsController.listContacts()` queries database
5. **Response**: Data flows back through the chain

```javascript
// Frontend component
const loadContacts = async () => {
  const response = await contactsService.getContacts();
  setContacts(response.items);
};

// Backend controller
exports.listContacts = async (req, res, next) => {
  const { rows, count } = await Contact.findAndCountAll({
    where: buildWhereClause(req.query),
    limit, offset
  });
  res.json({ success: true, page, limit, total: count, items: rows });
};
```

## Configuration

### Frontend Configuration

#### Vite Proxy Configuration (`vite.config.js`)
```javascript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
```

#### Environment Variables
Create `.env` file in frontend root:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=OdooXNmit
```

### Backend Configuration

#### Environment Variables (`.env`)
```env
# Database Configuration
MYSQL_DATABASE=odooxnmit
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_HOST=localhost

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Master Data Endpoints
- `GET /api/master/contacts` - List contacts
- `POST /api/master/contacts` - Create contact
- `PUT /api/master/contacts/:id` - Update contact
- `PATCH /api/master/contacts/:id/archive` - Archive contact

- `GET /api/master/products` - List products
- `POST /api/master/products` - Create product
- `PUT /api/master/products/:id` - Update product
- `PATCH /api/master/products/:id/archive` - Archive product

### Reports Endpoints
- `GET /api/reports/stock` - Stock report
- `GET /api/reports/pl` - Profit & Loss report
- `GET /api/reports/balance-sheet` - Balance sheet report

## Error Handling

### Frontend Error Handling
```javascript
try {
  const response = await contactsService.getContacts();
  setContacts(response.items);
} catch (error) {
  console.error('Failed to load contacts:', error);
  setError('Failed to load contacts. Using mock data for demo.');
  // Fallback to mock data
}
```

### Backend Error Handling
```javascript
// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';
  res.status(statusCode).json({ success: false, error: message });
});
```

## Development Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Create MySQL database: `CREATE DATABASE odooxnmit;`
2. Backend will automatically create tables on startup
3. Seed data available in `backend/scripts/seed.js`

## Testing the Integration

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 2. Test Authentication
1. Open http://localhost:3000
2. Try logging in with valid credentials
3. Check browser dev tools for API calls

### 3. Test Data Loading
1. Navigate to Contacts or Products
2. Verify data loads from backend
3. Check for any console errors

### 4. Test Error Handling
1. Stop backend server
2. Refresh frontend
3. Verify fallback to mock data

## Common Issues and Solutions

### 1. CORS Errors
**Problem**: Browser blocks requests due to CORS policy
**Solution**: Ensure backend CORS configuration includes frontend URL

### 2. Authentication Failures
**Problem**: 401 Unauthorized errors
**Solution**: Check JWT token storage and backend token validation

### 3. Database Connection Issues
**Problem**: Backend can't connect to database
**Solution**: Verify database credentials in `.env` file

### 4. Proxy Issues
**Problem**: Frontend can't reach backend
**Solution**: Check Vite proxy configuration and backend server status

## Security Considerations

### Frontend Security
- JWT tokens stored in localStorage
- Automatic token refresh on app initialization
- Input validation on forms
- XSS protection through React's built-in escaping

### Backend Security
- JWT token validation on protected routes
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration

## Performance Optimizations

### Frontend Optimizations
- Lazy loading of components
- Memoization of expensive calculations
- Debounced search inputs
- Loading states for better UX

### Backend Optimizations
- Database query optimization
- Pagination for large datasets
- Caching for frequently accessed data
- Connection pooling

## Monitoring and Debugging

### Frontend Debugging
- Browser dev tools Network tab
- React DevTools for component state
- Console logging for API calls
- Error boundaries for graceful error handling

### Backend Debugging
- Morgan logging for HTTP requests
- Console logging in controllers
- Database query logging
- Error stack traces

## Future Enhancements

### Planned Improvements
1. Real-time updates with WebSockets
2. File upload functionality
3. Advanced search and filtering
4. Export functionality (PDF, Excel)
5. Mobile responsive improvements
6. Unit and integration tests
7. Docker containerization
8. CI/CD pipeline setup

## Conclusion

The frontend-backend integration is designed to be maintainable, scalable, and user-friendly. The service layer pattern ensures clean separation of concerns, while the authentication system provides secure access control. The error handling and fallback mechanisms ensure a robust user experience even when the backend is unavailable.

For questions or issues, refer to the individual service files or contact the development team.
