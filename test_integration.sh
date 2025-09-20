#!/bin/bash

# OdooXNmit Integration Test Script
# This script tests the complete frontend-backend integration

echo "🚀 Starting OdooXNmit Integration Tests"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:3000"
TEST_USER_LOGIN="testuser"
TEST_USER_PASSWORD="TestPass123!"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local headers=$4
    local expected_status=$5
    local description=$6
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method -H "Content-Type: application/json" $headers -d "$data" "$url")
    else
        response=$(curl -s -w "%{http_code}" -X $method $headers "$url")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        print_result 0 "$description (HTTP $http_code)"
        return 0
    else
        print_result 1 "$description (Expected HTTP $expected_status, got HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

echo ""
echo "🔍 Testing Backend Server..."
echo "----------------------------"

# Test 1: Health check
test_endpoint "GET" "$BACKEND_URL/health" "" "" "200" "Backend health check"

# Test 2: Root endpoint
test_endpoint "GET" "$BACKEND_URL/" "" "" "200" "Backend root endpoint"

echo ""
echo "🔐 Testing Authentication..."
echo "----------------------------"

# Test 3: User registration
test_endpoint "POST" "$BACKEND_URL/api/auth/signup" '{"name":"Integration Test User","loginId":"inttest","email":"inttest@example.com","password":"TestPass123!","reenteredPassword":"TestPass123!"}' "" "201" "User registration"

# Test 4: User login
login_response=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"loginId\":\"$TEST_USER_LOGIN\",\"password\":\"$TEST_USER_PASSWORD\"}" "$BACKEND_URL/api/auth/login")
token=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$token" ]; then
    print_result 0 "User login (got token)"
    AUTH_HEADER="-H \"Authorization: Bearer $token\""
else
    print_result 1 "User login (no token received)"
    AUTH_HEADER=""
fi

echo ""
echo "📊 Testing Protected API Endpoints..."
echo "------------------------------------"

# Test 5: Get contacts (should be empty initially)
test_endpoint "GET" "$BACKEND_URL/api/master/contacts" "" "$AUTH_HEADER" "200" "Get contacts list"

# Test 6: Create a contact
test_endpoint "POST" "$BACKEND_URL/api/master/contacts" '{"name":"Test Contact","type":"Customer","email":"test@example.com","mobile":"1234567890"}' "$AUTH_HEADER" "201" "Create contact"

# Test 7: Get contacts again (should have the created contact)
test_endpoint "GET" "$BACKEND_URL/api/master/contacts" "" "$AUTH_HEADER" "200" "Get contacts after creation"

# Test 8: Get products
test_endpoint "GET" "$BACKEND_URL/api/master/products" "" "$AUTH_HEADER" "200" "Get products list"

# Test 9: Create a product
test_endpoint "POST" "$BACKEND_URL/api/master/products" '{"name":"Test Product","type":"Goods","salesPrice":100,"purchasePrice":80,"salesTax":18,"purchaseTax":18,"hsnCode":"1234","category":"Test"}' "$AUTH_HEADER" "201" "Create product"

# Test 10: Get reports
test_endpoint "GET" "$BACKEND_URL/api/reports/stock" "" "$AUTH_HEADER" "200" "Get stock report"

echo ""
echo "🌐 Testing Frontend Server..."
echo "-----------------------------"

# Test 11: Frontend health check
test_endpoint "GET" "$FRONTEND_URL" "" "" "200" "Frontend server response"

echo ""
echo "🔗 Testing Frontend-Backend Integration..."
echo "------------------------------------------"

# Test 12: Test API proxy through frontend
test_endpoint "GET" "$FRONTEND_URL/api/health" "" "" "200" "Frontend API proxy to backend"

echo ""
echo "📋 Integration Test Summary"
echo "=========================="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Test User: $TEST_USER_LOGIN"
echo ""
echo "✅ All tests completed!"
echo ""
echo "🎯 Next Steps:"
echo "1. Open $FRONTEND_URL in your browser"
echo "2. Try logging in with: $TEST_USER_LOGIN / $TEST_USER_PASSWORD"
echo "3. Navigate to Contacts or Products to see the integration in action"
echo "4. Check browser dev tools Network tab to see API calls"
echo ""
echo "📚 For detailed documentation, see:"
echo "- INTEGRATION_DOCUMENTATION.md"
echo "- QUICK_START.md"
