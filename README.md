# OdooXNmit - ERP System

A modern ERP (Enterprise Resource Planning) system built with React frontend and Node.js backend.

## 🏗️ **Architecture Overview**

```
Frontend (React)     ←→     Backend (Node.js)     ←→     Database (MySQL)
    Port: 3000                  Port: 5001                Sequelize ORM
```

## 🔗 **Frontend-Backend Integration**

### **How They Communicate**

The frontend and backend communicate through **REST API calls** using HTTP requests:

```
Frontend Component → API Service → HTTP Request → Backend Route → Controller → Database
                                                      ↓
Frontend Component ← JSON Response ← HTTP Response ← Backend Route ← Controller ← Database
```

## 📡 **API Architecture**

### **Base Configuration**

**Frontend API Service** (`/frontend/src/services/api.js`):
```javascript
const BASE_URL = 'http://localhost:5001/api';

// Every API call includes:
// - Authorization header with JWT token
// - Content-Type: application/json
// - Automatic error handling
```

**Backend API Routes** (`/backend/app.js`):
```javascript
// All API endpoints start with /api/
app.use('/api/auth', authRoutes);           // Authentication
app.use('/api/master/products', productRoutes);  // Products
app.use('/api/master/contacts', contactRoutes);  // Customers/Vendors
// ... more routes
```

## 🔐 **Authentication Flow**

### **1. Login Process**
```
Frontend Login Form → POST /api/auth/login → Backend validates → Returns JWT token
                                                    ↓
Frontend stores token in localStorage ← JWT token with user info
```

**Frontend Code:**
```javascript
// In authService.js
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ loginId, password })
});
const data = await response.json();
localStorage.setItem('auth_token', data.token);
```

**Backend Code:**
```javascript
// In authController.js
const user = await User.findOne({ where: { loginId } });
const token = jwt.sign({ userId: user.id }, JWT_SECRET);
res.json({ success: true, token, user });
```

### **2. Protected API Calls**
```
Frontend API Call → Includes JWT token in header → Backend validates token → Allows/Denies request
```

## 📊 **Master Data Management**

### **Products, Contacts, Taxes, Chart of Accounts**

**Frontend Service Pattern:**
```javascript
// Example: productsService.js
class ProductsService {
  async getProducts(params) {
    return apiService.get('/master/products', params);
  }
  
  async createProduct(productData) {
    return apiService.post('/master/products', productData);
  }
  
  async updateProduct(id, productData) {
    return apiService.put(`/master/products/${id}`, productData);
  }
  
  async deleteProduct(id) {
    return apiService.delete(`/master/products/${id}`);
  }
}
```

**Backend Controller Pattern:**
```javascript
// Example: productsController.js
exports.listProducts = async (req, res) => {
  const products = await Product.findAndCountAll({
    where: buildWhereClause(req.query),
    limit: req.query.limit || 10
  });
  res.json({ success: true, items: products.rows });
};
```

## 🛒 **Transaction Flow (Orders, Invoices, Bills)**

### **Purchase Order Example**

**1. Frontend Form Submission:**
```javascript
// In PurchaseOrder component
const handleSubmit = async (formData) => {
  const response = await purchaseOrdersService.createPurchaseOrder({
    vendor: formData.vendorId,
    items: [
      {
        product: 1,
        quantity: 2,
        unitPrice: 100,
        tax: 1
      }
    ]
  });
};
```

**2. Backend Processing:**
```javascript
// In purchaseOrdersController.js
exports.createPO = async (req, res) => {
  // 1. Validate vendor exists
  const vendor = await Contact.findByPk(req.body.vendor);
  
  // 2. Process items and calculate taxes
  const totalAmount = await calculatePOTotal(req.body.items);
  
  // 3. Create purchase order
  const po = await PurchaseOrder.create({
    vendor_id: req.body.vendor,
    items: req.body.items,
    total_amount: totalAmount,
    status: 'draft'
  });
  
  res.json({ success: true, item: po });
};
```

**3. Tax Calculation:**
```javascript
// Backend tax calculation
async function calculatePOTotal(items) {
  let total = 0;
  for (const item of items) {
    const lineTotal = item.quantity * item.unitPrice;
    
    // Get tax from database
    const tax = await Tax.findByPk(item.tax);
    let taxAmount = 0;
    
    if (tax.method === 'Percentage') {
      taxAmount = (lineTotal * tax.value) / 100;
    }
    
    total += lineTotal + taxAmount;
  }
  return total;
}
```

## 🖨️ **PDF Generation**

### **Centralized PDF Service**

**Frontend Request:**
```javascript
// Get PDF
const response = await fetch(`/api/purchase-orders/1/print?format=pdf`);
// Get JSON data for preview
const data = await fetch(`/api/purchase-orders/1/print`);
```

**Backend PDF Generation:**
```javascript
// In pdfService.js
class PDFService {
  async generatePurchaseOrderPDF(po, res) {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    
    // Add content to PDF
    doc.text('Purchase Order');
    doc.text(`PO Number: ${po.po_number}`);
    // ... more content
    
    doc.pipe(res);
    doc.end();
  }
}
```

## 📈 **Status Management**

### **Order Status Transitions**

**Frontend Status Buttons:**
```javascript
// In PurchaseOrderMaster component
const handleConfirm = async (id) => {
  await purchaseOrdersService.confirmPurchaseOrder(id);
  // Refresh list
};

const handleCancel = async (id) => {
  await purchaseOrdersService.cancelPurchaseOrder(id);
  // Refresh list
};
```

**Backend Status Validation:**
```javascript
// In purchaseOrdersController.js
exports.confirmPO = async (req, res) => {
  const po = await PurchaseOrder.findByPk(req.params.id);
  
  // Validate current status
  if (po.status !== 'draft') {
    return res.status(400).json({ 
      message: 'Only draft PO can be confirmed' 
    });
  }
  
  await po.update({ status: 'confirmed' });
  res.json({ success: true, item: po });
};
```

## 🔍 **Search and Filtering**

### **Dynamic Query Building**

**Frontend Search:**
```javascript
// In any Master component
const handleSearch = (searchTerm) => {
  const params = {
    q: searchTerm,        // Search term
    page: 1,              // Pagination
    limit: 50,            // Items per page
    type: 'Customer'      // Filter by type
  };
  
  contactsService.getContacts(params);
};
```

**Backend Query Processing:**
```javascript
// In controller
const where = {};
if (req.query.q) {
  where[Op.or] = [
    { name: { [Op.like]: `%${req.query.q}%` } },
    { email: { [Op.like]: `%${req.query.q}%` } }
  ];
}
if (req.query.type) where.type = req.query.type;

const results = await Model.findAndCountAll({ where });
```

## 🗂️ **File Structure**

### **Frontend Services**
```
/frontend/src/services/
├── api.js                 # Base API service with auth
├── authService.js         # Login/logout/user management
├── contactsService.js     # Customers & Vendors (unified)
├── productsService.js     # Product management
├── taxesService.js        # Tax management
├── coaService.js         # Chart of Accounts
├── salesOrdersService.js  # Sales Orders
├── purchaseOrdersService.js # Purchase Orders
└── reportsService.js      # Reports and analytics
```

### **Backend Structure**
```
/backend/
├── controllers/           # Business logic
├── models/               # Database models (Sequelize)
├── routes/               # API route definitions
├── services/             # Shared services (PDF, calculations)
├── middlewares/          # Auth, validation, error handling
└── app.js               # Express app configuration
```

## 🔄 **Data Flow Examples**

### **Creating a Customer**

1. **Frontend Form:**
   ```javascript
   const customerData = {
     name: "John Doe",
     type: "Customer",
     email: "john@example.com",
     mobile: "1234567890"
   };
   ```

2. **API Call:**
   ```javascript
   POST /api/master/contacts
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: customerData
   ```

3. **Backend Processing:**
   ```javascript
   // Validate data
   // Create in database
   const customer = await Contact.create(customerData);
   // Return response
   res.json({ success: true, item: customer });
   ```

4. **Frontend Response Handling:**
   ```javascript
   // Update UI optimistically
   // Show success message
   // Refresh customer list
   ```

### **Generating Reports**

1. **Frontend Request:**
   ```javascript
   const reportData = await reportsService.getStockReport({
     from: '2024-01-01',
     to: '2024-12-31'
   });
   ```

2. **Backend Calculation:**
   ```javascript
   // Query stock movements
   const movements = await StockLedger.findAll({ where: dateRange });
   
   // Calculate on-hand quantities
   const summary = calculateStockSummary(movements);
   
   res.json({ success: true, data: summary });
   ```

## 🛡️ **Security Features**

### **JWT Authentication**
- Every API call (except login) requires valid JWT token
- Tokens expire after set time
- Role-based access control (admin vs regular user)

### **Input Validation**
- Frontend: Form validation before submission
- Backend: express-validator for all inputs
- SQL injection prevention through Sequelize ORM

### **Error Handling**
- Consistent error response format
- User-friendly error messages
- Detailed logging for debugging

## 🚀 **Getting Started**

### **1. Start Backend**
```bash
cd backend
npm install
npm run dev    # Starts on http://localhost:5001
```

### **2. Start Frontend**
```bash
cd frontend
npm install
npm run dev    # Starts on http://localhost:3000
```

### **3. Test the Integration**
1. Open http://localhost:3000
2. Login with: `adminuser1` / `password123`
3. Try creating a product, customer, or order
4. Check the browser network tab to see API calls
5. Check backend console to see request processing

## 📋 **API Endpoints Summary**

| **Category** | **Endpoint** | **Method** | **Purpose** |
|--------------|--------------|------------|-------------|
| **Auth** | `/api/auth/login` | POST | User login |
| **Auth** | `/api/auth/me` | GET | Get current user |
| **Products** | `/api/master/products` | GET/POST | List/Create products |
| **Products** | `/api/master/products/:id` | GET/PUT/DELETE | Get/Update/Delete product |
| **Contacts** | `/api/master/contacts` | GET/POST | List/Create contacts |
| **Contacts** | `/api/master/contacts/:id` | GET/PUT/DELETE | Get/Update/Delete contact |
| **Orders** | `/api/purchase-orders` | GET/POST | List/Create POs |
| **Orders** | `/api/purchase-orders/:id/print` | GET | Generate PDF |
| **Orders** | `/api/purchase-orders/:id/confirm` | POST | Confirm PO |

## 🎯 **Key Integration Points**

1. **Authentication**: JWT tokens for secure API access
2. **Data Validation**: Both frontend and backend validation
3. **Error Handling**: Consistent error responses
4. **File Generation**: Server-side PDF creation
5. **Real-time Updates**: Optimistic UI updates
6. **Search & Filter**: Dynamic query building
7. **Status Management**: Workflow state transitions

This architecture ensures a clean separation between frontend and backend while maintaining efficient communication and data consistency! 🎉