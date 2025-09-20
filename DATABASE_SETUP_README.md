# OdooXNmit Database Setup Guide

This guide will help you set up the complete database with all sample records for the OdooXNmit application.

## 📁 Files Included

- `database_records.sql` - Complete SQL file with all table records
- `setup_database.sh` - Automated setup script
- `DATABASE_SETUP_README.md` - This guide

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Make the script executable
chmod +x setup_database.sh

# Run the setup script
./setup_database.sh
```

### Option 2: Manual Setup
```bash
# Connect to MySQL
mysql -u projectuser -pstrongpassword

# Create database (if not exists)
CREATE DATABASE odooxnmit;

# Exit MySQL and run the SQL file
mysql -u projectuser -pstrongpassword odooxnmit < database_records.sql
```

## 📊 Database Contents

The database will be populated with the following sample data:

| Table | Records | Description |
|-------|---------|-------------|
| Users | 3 | Admin, Test User, Accountant |
| Contacts | 10 | 5 Customers, 5 Vendors |
| Products | 18 | Electronics, Furniture, Office Supplies, Services |
| Taxes | 4 | GST rates (5%, 12%, 18%, No Tax) |
| CoA | 20 | Chart of Accounts (Assets, Liabilities, Income, Expenses) |
| Sales Orders | 9 | Various order statuses |
| Invoices | 8 | Customer invoices with different statuses |
| Counters | 9 | Sequential number generators |

## 🔑 Test Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Admin |
| testuser | password123 | Invoicing |
| accountant | password123 | Invoicing |

## 🏃‍♂️ Running the Application

After database setup:

1. **Start Backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔧 Database Configuration

- **Database Name:** odooxnmit
- **Username:** projectuser
- **Password:** strongpassword
- **Host:** localhost
- **Port:** 3306

## 📝 Sample Data Details

### Users
- Admin user with full access
- Test user for invoicing
- Accountant user for financial operations

### Contacts
- **Customers:** ABC Corporation, XYZ Industries, Tech Solutions, Global Enterprises, Startup Hub
- **Vendors:** Supplier One, Material Suppliers, Office Supplies Co., Tech Equipment, Furniture World

### Products
- **Electronics:** Laptops, Desktops, Printers, Monitors, Keyboards, Mice
- **Furniture:** Office Chairs, Desks, Filing Cabinets, Bookshelves
- **Office Supplies:** Stationery, Paper, Pens, Notebooks
- **Services:** Website Development, Consulting, Maintenance, Training, Design

### Sales Orders
- Various order statuses (Draft, Invoiced, Paid)
- Different customer orders
- Mixed product and service orders

### Invoices
- Customer invoices with different payment statuses
- Paid, Pending, and Overdue invoices
- Realistic amounts and tax calculations

## 🛠️ Troubleshooting

### Common Issues:

1. **MySQL Connection Error:**
   - Ensure MySQL is running
   - Check credentials in the script
   - Verify user permissions

2. **Duplicate Key Errors:**
   - Run the setup script with data clearing option
   - Or manually truncate tables before running

3. **Permission Denied:**
   - Make sure the script is executable: `chmod +x setup_database.sh`
   - Check file permissions

### Manual Table Reset:
```sql
-- Connect to MySQL
mysql -u projectuser -pstrongpassword odooxnmit

-- Clear all data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Users;
TRUNCATE TABLE Contacts;
TRUNCATE TABLE Products;
TRUNCATE TABLE Taxes;
TRUNCATE TABLE CoA;
TRUNCATE TABLE SalesOrders;
TRUNCATE TABLE Invoices;
TRUNCATE TABLE Counters;
SET FOREIGN_KEY_CHECKS = 1;
```

## 📞 Support

If you encounter any issues:
1. Check the error messages in the terminal
2. Verify MySQL is running and accessible
3. Ensure all required tables exist in the database
4. Check the application logs for backend errors

## 🎯 Next Steps

After successful database setup:
1. Test the login functionality
2. Navigate through different modules
3. Create new records to test CRUD operations
4. Verify data persistence across page refreshes

---

**Happy Coding! 🚀**
