#!/bin/bash

# Database Seeding Script for OdooXNmit
# This script will populate your database with sample data

echo "🌱 Starting Database Seeding for OdooXNmit"
echo "=========================================="

# Database configuration
DB_USER="projectuser"
DB_PASSWORD="strongpassword"
DB_NAME="odooxnmit"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo "🔍 Checking MySQL connection..."
if ! mysql -u $DB_USER -p$DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to MySQL. Please check:${NC}"
    echo "1. MySQL is running"
    echo "2. Database credentials are correct"
    echo "3. Database '$DB_NAME' exists"
    exit 1
fi

echo -e "${GREEN}✅ MySQL connection successful${NC}"

# Check if database exists
echo "🔍 Checking if database '$DB_NAME' exists..."
if ! mysql -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME;" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' does not exist. Creating it...${NC}"
    mysql -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Ask user which seed data to use
echo ""
echo "📋 Choose seed data option:"
echo "1. Quick seed (minimal data for testing)"
echo "2. Full seed (comprehensive data with all tables)"
echo "3. Skip seeding"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🌱 Running quick seed data..."
        mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < quick_seed_data.sql
        ;;
    2)
        echo "🌱 Running full seed data..."
        mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database_seed_data.sql
        ;;
    3)
        echo "⏭️  Skipping seed data"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully!${NC}"
    echo ""
    echo "📊 Database Summary:"
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
    echo "🎯 Test Credentials:"
    echo "Username: testuser"
    echo "Password: password123"
    echo ""
    echo "Username: admin"
    echo "Password: password123"
    echo ""
    echo "🚀 You can now start your application:"
    echo "Backend: cd backend && node server.js"
    echo "Frontend: cd frontend && npm run dev"
else
    echo -e "${RED}❌ Error seeding database. Please check the error messages above.${NC}"
    exit 1
fi
