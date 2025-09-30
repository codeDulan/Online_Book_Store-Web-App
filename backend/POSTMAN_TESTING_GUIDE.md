# Postman Testing Guide - Material Purchase Functionality

## Prerequisites
1. Start the Spring Boot application
2. Have Postman installed
3. Database should be running (MySQL on port 3307 as per config)

## Step-by-Step Postman Testing

### Step 1: Register a User (if needed)
```
POST http://localhost:8080/api/auth/register
```
**Headers:**
- Content-Type: application/json

**Body (JSON):**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response:** 201 Created
```json
{
  "message": "User created"
}
```

### Step 2: Login as User
```
POST http://localhost:8080/api/auth/login
```
**Headers:**
- Content-Type: application/json

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response:** 200 OK
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "ROLE_USER"
}
```

**⚠️ IMPORTANT:** Copy the `token` value - you'll need this for all subsequent requests!

### Step 3: Login as Admin (to create material with price)
```
POST http://localhost:8080/api/auth/login
```
**Headers:**
- Content-Type: application/json

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Response:** Admin token (copy this too)

### Step 4: Create Material with Price (Admin)
```
POST http://localhost:8080/api/admin/materials
```
**Headers:**
- Authorization: Bearer {ADMIN_TOKEN}
- Content-Type: multipart/form-data

**Body (form-data):**
- Key: `file` | Type: File | Value: [Upload a PDF file]
- Key: `metadata` | Type: Text | Value:
```json
{
  "title": "Advanced Java Programming",
  "university": "University of Colombo",
  "faculty": "Science",
  "studentYear": 2,
  "courseModule": "CS2020",
  "price": 1500.00
}
```

**Expected Response:** 201 Created with material details including ID

### Step 5: Browse Materials as User
```
GET http://localhost:8080/api/user/materials
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 200 OK
```json
[
  {
    "id": 1,
    "title": "Advanced Java Programming",
    "university": "University of Colombo",
    "faculty": "Science",
    "studentYear": 2,
    "courseModule": "CS2020",
    "price": 1500.00,
    "uploadedAt": "2025-09-30T16:30:00Z",
    "purchased": false
  }
]
```

### Step 6: Check Purchase Status (Optional)
```
GET http://localhost:8080/api/materials/1/purchased
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 200 OK
```json
{
  "purchased": false
}
```

### Step 7: Purchase the Material ⭐ MAIN STEP
```
POST http://localhost:8080/api/materials/1/purchase
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Body:** Empty (no body needed)

**Expected Response:** 201 Created
```json
{
  "id": 1,
  "material": {
    "id": 1,
    "title": "Advanced Java Programming",
    "university": "University of Colombo",
    "faculty": "Science",
    "studentYear": 2,
    "courseModule": "CS2020",
    "price": 1500.00,
    "uploadedAt": "2025-09-30T16:30:00Z",
    "purchased": true
  },
  "purchasePrice": 1500.00,
  "purchaseDate": "2025-09-30T16:35:00",
  "status": "COMPLETED"
}
```

### Step 8: Verify Purchase Status
```
GET http://localhost:8080/api/materials/1/purchased
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 200 OK
```json
{
  "purchased": true
}
```

### Step 9: View Purchase History
```
GET http://localhost:8080/api/purchases
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 200 OK
```json
[
  {
    "id": 1,
    "material": {
      "id": 1,
      "title": "Advanced Java Programming",
      "university": "University of Colombo",
      "faculty": "Science",
      "studentYear": 2,
      "courseModule": "CS2020",
      "price": 1500.00,
      "uploadedAt": "2025-09-30T16:30:00Z",
      "purchased": true
    },
    "purchasePrice": 1500.00,
    "purchaseDate": "2025-09-30T16:35:00",
    "status": "COMPLETED"
  }
]
```

### Step 10: Download Purchased Material
```
GET http://localhost:8080/api/materials/1/download
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 200 OK with PDF file download

### Step 11: Test Error Cases

#### Try to Purchase Same Material Again
```
POST http://localhost:8080/api/materials/1/purchase
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 400 Bad Request
```json
{
  "error": "Material already purchased by user"
}
```

#### Try to Download Without Purchase (create another material first)
```
GET http://localhost:8080/api/materials/2/download
```
**Headers:**
- Authorization: Bearer {USER_TOKEN}

**Expected Response:** 403 Forbidden

## Postman Collection Setup Tips

### 1. Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:8080`
- `user_token`: (will be set after login)
- `admin_token`: (will be set after admin login)

### 2. Auto-Set Token Script
Add this to the "Tests" tab of your login requests:
```javascript
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("user_token", jsonData.token);
});
```

### 3. Pre-request Script for Auth
Add this to requests that need authentication:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get("user_token")
});
```

## Common Issues & Solutions

1. **401 Unauthorized**: Check if token is correctly set in Authorization header
2. **403 Forbidden**: User trying to access admin endpoint or download unpurchased material
3. **400 Bad Request**: Check request body format or trying to purchase already purchased material
4. **404 Not Found**: Material ID doesn't exist
5. **500 Internal Server Error**: Check if database is running and application started properly

## Testing Sequence Summary
1. Register User → 2. Login User → 3. Login Admin → 4. Create Material → 5. Browse Materials → 6. Purchase Material → 7. Download Material → 8. View History