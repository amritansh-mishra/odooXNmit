#!/bin/bash

# =====================================================
# ODOOXNMIT DATABASE SETUP SCRIPT
# =====================================================
# This script will set up the complete database with all records
# Run this script to populate your MySQL database

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}    ODOOXNMIT DATABASE SETUP SCRIPT${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Database configuration
DB_USER="projectuser"
DB_PASSWORD="strongpassword"
DB_NAME="odooxnmit"

# Check if MySQL is running
echo -e "${YELLOW}🔍 Checking MySQL connection...${NC}"
if ! mysql -u $DB_USER -p$DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to MySQL. Please check:${NC}"
    echo "1. MySQL is running"
    echo "2. Database credentials are correct"
    echo "3. User '$DB_USER' has proper permissions"
    exit 1
fi

echo -e "${GREEN}✅ MySQL connection successful${NC}"

# Check if database exists, create if not
echo -e "${YELLOW}🔍 Checking if database '$DB_NAME' exists...${NC}"
if ! mysql -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME;" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' does not exist. Creating it...${NC}"
    mysql -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${GREEN}✅ Database exists${NC}"
fi

# Ask user if they want to clear existing data
echo ""
echo -e "${YELLOW}⚠️  This will populate the database with sample data.${NC}"
echo -e "${YELLOW}   If data already exists, it may cause duplicate key errors.${NC}"
echo ""
read -p "Do you want to clear existing data first? (y/N): " clear_data

if [[ $clear_data =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Clearing existing data...${NC}"
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE Users;
    TRUNCATE TABLE Contacts;
    TRUNCATE TABLE Products;
    TRUNCATE TABLE Taxes;
    TRUNCATE TABLE CoA;
    TRUNCATE TABLE SalesOrders;
    TRUNCATE TABLE Invoices;
    TRUNCATE TABLE Counters;
    SET FOREIGN_KEY_CHECKS = 1;"
    echo -e "${GREEN}✅ Existing data cleared${NC}"
fi

# Populate database
echo -e "${YELLOW}🌱 Populating database with sample data...${NC}"
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database_records.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database populated successfully!${NC}"
    echo ""
    
    # Display summary
    echo -e "${BLUE}📊 Database Summary:${NC}"
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
    SELECT 'Users' as Table_Name, COUNT(*) as Records FROM Users
    UNION ALL
    SELECT 'Contacts', COUNT(*) FROM Contacts
    UNION ALL
    SELECT 'Products', COUNT(*) FROM Products
    UNION ALL
    SELECT 'Taxes', COUNT(*) FROM Taxes
    UNION ALL
    SELECT 'CoA', COUNT(*) FROM CoA
    UNION ALL
    SELECT 'Sales Orders', COUNT(*) FROM SalesOrders
    UNION ALL
    SELECT 'Invoices', COUNT(*) FROM Invoices
    UNION ALL
    SELECT 'Counters', COUNT(*) FROM Counters;"
    
    echo ""
    echo -e "${BLUE}🎯 Test Credentials:${NC}"
    echo -e "${GREEN}Username: admin${NC}        ${GREEN}Password: password123${NC}"
    echo -e "${GREEN}Username: testuser${NC}     ${GREEN}Password: password123${NC}"
    echo -e "${GREEN}Username: accountant${NC}   ${GREEN}Password: password123${NC}"
    
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "1. Start Backend:  ${GREEN}cd backend && node server.js${NC}"
    echo "2. Start Frontend: ${GREEN}cd frontend && npm run dev${NC}"
    echo "3. Access App:     ${GREEN}http://localhost:3000${NC}"
    
    echo ""
    echo -e "${GREEN}🎉 Database setup complete! Your OdooXNmit application is ready to use.${NC}"
    
else
    echo -e "${RED}❌ Error populating database. Please check the error messages above.${NC}"
    exit 1
fi
