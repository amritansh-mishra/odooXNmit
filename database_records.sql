-- =====================================================
-- ODOOXNMIT DATABASE RECORDS - FINAL WORKING VERSION
-- =====================================================
-- This file contains the corrected database records that work with the actual schema

USE odooxnmit;

-- =====================================================
-- 1. USERS TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO users
(name, login_id, email, password, role, password_reset_token, password_reset_expires, created_at, updated_at)
VALUES
('Admin User', 'adminuser1', 'admin1@odooxnmit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL, NOW(), NOW()),
('Test User', 'testuser1', 'test1@odooxnmit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'invoicing', NULL, NULL, NOW(), NOW()),
('Accountant', 'accountant1', 'accountant1@odooxnmit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'invoicing', NULL, NULL, NOW(), NOW()),
('New Admin', 'newadmin', 'newadmin@odooxnmit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL, NOW(), NOW()),
('New User', 'newuser', 'newuser@odooxnmit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'invoicing', NULL, NULL, NOW(), NOW()),
('New Accountant', 'newaccountant', 'newaccountant@odooxnmit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'invoicing', NULL, NULL, NOW(), NOW());

-- =====================================================
-- 2. TAXES TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO taxes (name, method, value, applicable_on, is_active, created_at, updated_at) VALUES
('GST 5%', 'Percentage', 5.00, 'Both', 1, NOW(), NOW()),
('GST 12%', 'Percentage', 12.00, 'Both', 1, NOW(), NOW()),
('GST 18%', 'Percentage', 18.00, 'Both', 1, NOW(), NOW()),
('No Tax', 'Percentage', 0.00, 'Both', 1, NOW(), NOW());

-- =====================================================
-- 3. CONTACTS TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO contacts (name, type, email, mobile, address_city, address_state, is_active, created_at, updated_at) VALUES
-- Customers
('ABC Corporation Ltd.', 'Customer', 'contact@abccorp.com', '+91-9876543210', 'Mumbai', 'Maharashtra', 1, NOW(), NOW()),
('XYZ Industries Pvt. Ltd.', 'Customer', 'sales@xyzindustries.com', '+91-9876543211', 'Delhi', 'Delhi', 1, NOW(), NOW()),
('Tech Solutions Inc.', 'Customer', 'info@techsolutions.com', '+91-9876543212', 'Bangalore', 'Karnataka', 1, NOW(), NOW()),
('Global Enterprises', 'Customer', 'contact@globalent.com', '+91-9876543213', 'Chennai', 'Tamil Nadu', 1, NOW(), NOW()),
('Startup Hub Pvt. Ltd.', 'Customer', 'orders@startuphub.com', '+91-9876543214', 'Pune', 'Maharashtra', 1, NOW(), NOW()),
-- Vendors
('Supplier One Ltd.', 'Vendor', 'purchase@supplierone.com', '+91-9876543215', 'Mumbai', 'Maharashtra', 1, NOW(), NOW()),
('Material Suppliers', 'Vendor', 'orders@materialsuppliers.com', '+91-9876543216', 'Delhi', 'Delhi', 1, NOW(), NOW()),
('Office Supplies Co.', 'Vendor', 'sales@officesupplies.com', '+91-9876543217', 'Bangalore', 'Karnataka', 1, NOW(), NOW()),
('Tech Equipment Ltd.', 'Vendor', 'sales@techequipment.com', '+91-9876543218', 'Hyderabad', 'Telangana', 1, NOW(), NOW()),
('Furniture World', 'Vendor', 'orders@furnitureworld.com', '+91-9876543219', 'Gurgaon', 'Haryana', 1, NOW(), NOW());

-- =====================================================
-- 4. PRODUCTS TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO products (name, type, sales_price, purchase_price, sales_tax, purchase_tax, hsn_code, category, is_active, created_at, updated_at) VALUES
-- Electronics
('Laptop Computer', 'Goods', 75000.00, 60000.00, 18.00, 18.00, '8471', 'Electronics', 1, NOW(), NOW()),
('Desktop Computer', 'Goods', 50000.00, 40000.00, 18.00, 18.00, '8471', 'Electronics', 1, NOW(), NOW()),
('Printer', 'Goods', 25000.00, 20000.00, 18.00, 18.00, '8443', 'Electronics', 1, NOW(), NOW()),
('Monitor 24 inch', 'Goods', 15000.00, 12000.00, 18.00, 18.00, '8528', 'Electronics', 1, NOW(), NOW()),
('Keyboard', 'Goods', 2000.00, 1500.00, 18.00, 18.00, '8471', 'Electronics', 1, NOW(), NOW()),
('Mouse', 'Goods', 500.00, 300.00, 18.00, 18.00, '8471', 'Electronics', 1, NOW(), NOW()),
-- Furniture
('Office Chair', 'Goods', 15000.00, 12000.00, 18.00, 18.00, '9401', 'Furniture', 1, NOW(), NOW()),
('Office Desk', 'Goods', 20000.00, 16000.00, 18.00, 18.00, '9403', 'Furniture', 1, NOW(), NOW()),
('Filing Cabinet', 'Goods', 8000.00, 6000.00, 18.00, 18.00, '9403', 'Furniture', 1, NOW(), NOW()),
('Bookshelf', 'Goods', 12000.00, 9000.00, 18.00, 18.00, '9403', 'Furniture', 1, NOW(), NOW()),
-- Office Supplies
('Stationery Set', 'Goods', 500.00, 400.00, 12.00, 12.00, '4820', 'Office Supplies', 1, NOW(), NOW()),
('A4 Paper Ream', 'Goods', 300.00, 250.00, 12.00, 12.00, '4802', 'Office Supplies', 1, NOW(), NOW()),
('Pen Set', 'Goods', 200.00, 150.00, 12.00, 12.00, '9608', 'Office Supplies', 1, NOW(), NOW()),
('Notebook', 'Goods', 100.00, 80.00, 12.00, 12.00, '4820', 'Office Supplies', 1, NOW(), NOW()),
-- Services
('Website Development', 'Service', 50000.00, 0.00, 18.00, 0.00, '998314', 'IT Services', 1, NOW(), NOW()),
('Consulting Services', 'Service', 2000.00, 0.00, 18.00, 0.00, '998314', 'Professional Services', 1, NOW(), NOW()),
('Maintenance Service', 'Service', 5000.00, 0.00, 18.00, 0.00, '998314', 'Support Services', 1, NOW(), NOW()),
('Training Services', 'Service', 10000.00, 0.00, 18.00, 0.00, '998314', 'Education Services', 1, NOW(), NOW()),
('Design Services', 'Service', 15000.00, 0.00, 18.00, 0.00, '998314', 'Creative Services', 1, NOW(), NOW());

-- =====================================================
-- 5. CHART OF ACCOUNTS (if not exists)
-- =====================================================
INSERT IGNORE INTO coa (type, description, account_name, is_active, created_at, updated_at) VALUES
-- Assets
('Asset', 'Cash in Hand', 'Cash in Hand', 1, NOW(), NOW()),
('Asset', 'Bank Account - SBI', 'Bank Account - SBI', 1, NOW(), NOW()),
('Asset', 'Bank Account - HDFC', 'Bank Account - HDFC', 1, NOW(), NOW()),
('Asset', 'Accounts Receivable', 'Accounts Receivable', 1, NOW(), NOW()),
('Asset', 'Inventory', 'Inventory', 1, NOW(), NOW()),
('Asset', 'Office Equipment', 'Office Equipment', 1, NOW(), NOW()),
('Asset', 'Computer Equipment', 'Computer Equipment', 1, NOW(), NOW()),
('Asset', 'Furniture & Fixtures', 'Furniture & Fixtures', 1, NOW(), NOW()),
-- Liabilities
('Liability', 'Accounts Payable', 'Accounts Payable', 1, NOW(), NOW()),
('Liability', 'Outstanding Expenses', 'Outstanding Expenses', 1, NOW(), NOW()),
('Liability', 'Bank Loan', 'Bank Loan', 1, NOW(), NOW()),
('Liability', 'Accrued Liabilities', 'Accrued Liabilities', 1, NOW(), NOW()),
-- Income
('Income', 'Sales Revenue', 'Sales Revenue', 1, NOW(), NOW()),
('Income', 'Service Revenue', 'Service Revenue', 1, NOW(), NOW()),
('Income', 'Other Income', 'Other Income', 1, NOW(), NOW()),
-- Expenses
('Expense', 'Cost of Goods Sold', 'Cost of Goods Sold', 1, NOW(), NOW()),
('Expense', 'Office Rent', 'Office Rent', 1, NOW(), NOW()),
('Expense', 'Electricity Bill', 'Electricity Bill', 1, NOW(), NOW()),
('Expense', 'Internet Bill', 'Internet Bill', 1, NOW(), NOW()),
('Expense', 'Salary Expenses', 'Salary Expenses', 1, NOW(), NOW()),
('Expense', 'Marketing Expenses', 'Marketing Expenses', 1, NOW(), NOW()),
('Expense', 'Travel Expenses', 'Travel Expenses', 1, NOW(), NOW()),
('Expense', 'Office Supplies', 'Office Supplies', 1, NOW(), NOW());

-- =====================================================
-- 6. SALES ORDERS TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO SalesOrders
(customer_id, items, status, total_amount, so_number, so_date, created_at, updated_at)
VALUES
(1, '[{"product_id":1,"quantity":2,"price":120000.00}]', 'draft', 240000.00, 'SO3001', NOW(), NOW(), NOW()),
(2, '[{"product_id":2,"quantity":1,"price":15000.00}]', 'draft', 15000.00, 'SO3002', NOW(), NOW(), NOW()),
(3, '[{"product_id":3,"quantity":1,"price":25000.00}]', 'draft', 25000.00, 'SO3003', NOW(), NOW(), NOW()),
(4, '[{"product_id":4,"quantity":3,"price":15000.00}]', 'draft', 45000.00, 'SO3004', NOW(), NOW(), NOW()),
(5, '[{"product_id":5,"quantity":1,"price":2000.00}]', 'draft', 2000.00, 'SO3005', NOW(), NOW(), NOW());

-- =====================================================
-- 7. INVOICES TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO invoices
(invoice_number, customer_id, sales_order_id, items, status, invoice_date, total_untaxed_amount, total_tax_amount, total_amount, created_at, updated_at)
VALUES
('INV3001', 1, 1, '[{"product_id":1,"quantity":2,"price":120000.00}]', 'draft', NOW(), 240000.00, 0.00, 240000.00, NOW(), NOW()),
('INV3002', 2, 2, '[{"product_id":2,"quantity":1,"price":15000.00}]', 'draft', NOW(), 15000.00, 0.00, 15000.00, NOW(), NOW()),
('INV3003', 3, 3, '[{"product_id":3,"quantity":1,"price":25000.00}]', 'draft', NOW(), 25000.00, 0.00, 25000.00, NOW(), NOW()),
('INV3004', 4, 4, '[{"product_id":4,"quantity":3,"price":15000.00}]', 'draft', NOW(), 45000.00, 0.00, 45000.00, NOW(), NOW()),
('INV3005', 5, 5, '[{"product_id":5,"quantity":1,"price":2000.00}]', 'draft', NOW(), 2000.00, 0.00, 2000.00, NOW(), NOW());

-- =====================================================
-- 8. COUNTERS TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO counters (`key`, seq, created_at, updated_at) VALUES
('sales_order', 5, NOW(), NOW()),
('purchase_order', 0, NOW(), NOW()),
('invoice', 5, NOW(), NOW()),
('vendor_bill', 0, NOW(), NOW()),
('payment', 0, NOW(), NOW()),
('quotation', 0, NOW(), NOW()),
('receipt', 0, NOW(), NOW()),
('credit_note', 0, NOW(), NOW()),
('debit_note', 0, NOW(), NOW());

-- =====================================================
-- 9. VENDOR BILLS TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO VendorBills
(bill_number, vendor_id, invoice_date, due_date, status, items, total_untaxed_amount, total_tax_amount, total_amount, created_at, updated_at)
VALUES
('VB3001', 6, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'draft', '[{"product_id":1,"quantity":5,"price":100000.00}]', 500000.00, 90000.00, 590000.00, NOW(), NOW()),
('VB3002', 7, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'draft', '[{"product_id":2,"quantity":10,"price":0.00}]', 0.00, 0.00, 0.00, NOW(), NOW());

-- =====================================================
-- 10. STOCK LEDGER TABLE (if not exists)
-- =====================================================
INSERT IGNORE INTO StockLedger
(product_id, type, quantity, reference, date, created_at, updated_at)
VALUES
(1, 'In', 10.00, 'Initial Stock', NOW(), NOW(), NOW()),
(2, 'In', 5.00, 'Initial Service Package', NOW(), NOW(), NOW()),
(1, 'In', 5.00, 'Vendor Bill VB3001', NOW(), NOW(), NOW()),
(2, 'In', 10.00, 'Vendor Bill VB3002', NOW(), NOW(), NOW());

-- =====================================================
-- 11. PAYMENTS TABLE (if not exists)
-- =====================================================
-- Customer Payments (against invoices)
INSERT IGNORE INTO payments
(amount, notes, invoice_id, payment_date, payment_mode, created_at, updated_at)
VALUES
(240000.00, 'Full payment for INV3001', 1, NOW(), 'Bank', NOW(), NOW()),
(15000.00, 'Full payment for INV3002', 2, NOW(), 'Cash', NOW(), NOW()),
(25000.00, 'Full payment for INV3003', 3, NOW(), 'Bank', NOW(), NOW()),
(45000.00, 'Full payment for INV3004', 4, NOW(), 'Cheque', NOW(), NOW()),
(2000.00, 'Full payment for INV3005', 5, NOW(), 'Cash', NOW(), NOW());

-- Vendor Payments (against vendor bills)
INSERT IGNORE INTO payments
(amount, notes, invoice_id, payment_date, payment_mode, created_at, updated_at)
VALUES
(590000.00, 'Payment for VB3001', NULL, NOW(), 'Bank', NOW(), NOW()),
(0.00, 'Payment for VB3002', NULL, NOW(), 'Cash', NOW(), NOW());

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Display summary of inserted data
SELECT 'Database populated successfully!' as Status;

SELECT 'users' as Table_Name, COUNT(*) as Records FROM users
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'taxes', COUNT(*) FROM taxes
UNION ALL
SELECT 'coa', COUNT(*) FROM coa
UNION ALL
SELECT 'SalesOrders', COUNT(*) FROM SalesOrders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'counters', COUNT(*) FROM counters
UNION ALL
SELECT 'VendorBills', COUNT(*) FROM VendorBills
UNION ALL
SELECT 'StockLedger', COUNT(*) FROM StockLedger
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

-- =====================================================
-- TEST CREDENTIALS
-- =====================================================
-- Username: adminuser1, Password: password123
-- Username: testuser1, Password: password123
-- Username: accountant1, Password: password123
-- Username: newadmin, Password: password123
-- Username: newuser, Password: password123
-- Username: newaccountant, Password: password123

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- 1. Make sure MySQL is running
-- 2. Create database: CREATE DATABASE odooxnmit;
-- 3. Run this script: mysql -u projectuser -pstrongpassword odooxnmit < final_database_records.sql
-- 4. Start backend: cd backend && node server.js
-- 5. Start frontend: cd frontend && npm run dev
-- 6. Access application: http://localhost:3000
