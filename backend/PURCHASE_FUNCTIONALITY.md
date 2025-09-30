# Online Book Store - Purchase Functionality

## New Features Added

### 1. Material Pricing
- Added `price` column to the Material entity
- Materials now have a price that users need to pay to access

### 2. Purchase System
- **Purchase Entity**: Tracks user purchases with purchase date, price, and status
- **Purchase Status**: PENDING, COMPLETED, FAILED, REFUNDED
- Users can only download materials they have purchased
- Admins can download any material without purchase

### 3. New API Endpoints

#### For Users (requires USER role):

**Browse Materials:**
- `GET /api/user/materials` - Get all materials with purchase status
- `GET /api/user/materials/{id}` - Get single material with purchase status
- `GET /api/user/materials/search/university/{university}` - Search by university
- `GET /api/user/materials/search/faculty/{faculty}` - Search by faculty

**Purchase Operations:**
- `POST /api/materials/{materialId}/purchase` - Purchase a material
- `GET /api/purchases` - Get user's purchase history
- `GET /api/materials/{materialId}/purchased` - Check if material is purchased

**Download:**
- `GET /api/materials/{id}/download` - Download purchased materials (blocked if not purchased)

#### For Admins (requires ADMIN role):

**Admin Operations:**
- All existing CRUD operations for materials (now including price)
- `GET /api/admin/purchases` - Get all purchases across all users
- Can download any material without purchase requirement

### 4. JWT Token Enhancement
- JWT tokens now include user ID in claims
- Enables proper user identification for purchase tracking

### 5. Data Transfer Objects (DTOs)
- `MaterialDTO`: Includes purchase status for current user
- `PurchaseDTO`: Safe representation of purchase data

## Usage Flow

1. **Admin adds materials** with price through existing admin endpoints
2. **Users browse materials** using `/api/user/materials` to see prices and purchase status
3. **Users purchase materials** using `/api/materials/{id}/purchase`
4. **Users download purchased materials** using `/api/materials/{id}/download`
5. **Users view purchase history** using `/api/purchases`

## Database Changes

The application will automatically add the `price` column to the `materials` table and create the `purchases` table on next startup due to `hibernate.ddl-auto=update` configuration.

## Security

- Users can only see and purchase materials, not modify them
- Users can only download materials they have purchased
- Admins retain all existing privileges
- JWT tokens are required for all operations
- Purchase validation prevents duplicate purchases