const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Basic security
app.use(helmet());

// Simple CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'OdooXNmit Backend API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/master/products',
      '/api/master/contacts',
      '/api/master/taxes',
      '/api/master/coa',
      '/api/sales-orders',
      '/api/purchase-orders',
      '/api/vendor-bills',
      '/api/customer-invoices',
      '/api/reports',
      '/api/ledger'
    ]
  });
});

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Master data routes
app.use('/api/master/products', require('./routes/master.products'));
app.use('/api/master/contacts', require('./routes/master.contacts'));
app.use('/api/master/taxes', require('./routes/master.taxes'));
app.use('/api/master/coa', require('./routes/master.coa'));

// Transaction routes
app.use('/api/sales-orders', require('./routes/salesOrders'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/vendor-bills', require('./routes/vendorBills'));
app.use('/api/customer-invoices', require('./routes/customerInvoices'));

// Report routes
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ledger', require('./routes/ledger'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to OdooXNmit Backend API',
    version: '1.0.0',
    status: 'Active'
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({
    success: false,
    error: message
  });
});

module.exports = app;