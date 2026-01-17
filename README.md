# Menu & Services Management Backend

A production-grade, clean-architecture backend system for restaurant/booking SaaS applications with sophisticated business logic including dynamic tax inheritance, flexible pricing engine, and booking conflict prevention.

</ English>

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Business Logic Highlights](#business-logic-highlights)
4. [Tech Stack](#tech-stack)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Testing](#testing)
10. [Docker Support](#docker-support)
11. [Design Decisions](#design-decisions)

---

## Features

### Core Entities
- **Categories** - Top-level grouping with tax configuration
- **Subcategories** - Optional tax override capability
- **Items** - 5 pricing types supported with booking capabilities
- **Add-ons** - Optional/mandatory with grouping support
- **Bookings** - Time slot management with conflict prevention

### Business Capabilities
✅ **Dynamic Tax Inheritance** (Item → Subcategory → Category)  
✅ **5 Pricing Types**: Static, Tiered, Complimentary, Discounted, Dynamic Time-based  
✅ **Booking System** with availability slots and conflict detection  
✅ **Soft Delete** with cascading to dependent entities  
✅ **Advanced Search, Filtering & Pagination** on all list endpoints  
✅ **Transaction Support** for booking conflict prevention (when replica set available)

---

## Architecture

Clean layered architecture with clear separation of concerns:

```
src/
 ├── app.ts                    # Express app configuration
 ├── server.ts                 # Server entry point
 ├── config/                   # Database & app configuration
 │   └── database.ts
 ├── constants/                # Enums, error messages, validation rules
 │   └── index.ts
 ├── models/                   # Mongoose schemas
 │   ├── category.model.ts
 │   ├── subcategory.model.ts
 │   ├── item.model.ts
 │   ├── addon.model.ts
 │   └── booking.model.ts
 ├── validators/               # Zod validation schemas
 │   ├── category.validator.ts
 │   ├── item.validator.ts
 │   └── booking.validator.ts
 ├── repositories/             # Database operations only
 │   ├── category.repository.ts
 │   ├── subcategory.repository.ts
 │   ├── item.repository.ts
 │   ├── addon.repository.ts
 │   └── booking.repository.ts
 ├── utils/                    # Reusable business logic helpers
 │   ├── tax-resolver.util.ts         # Tax inheritance logic
 │   ├── pricing-engine.util.ts       # Dynamic pricing calculations
 │   ├── availability.util.ts         # Slot availability
 │   └── pagination.util.ts
 ├── services/                 # Business logic layer
 │   ├── category.service.ts
 │   ├── subcategory.service.ts
 │   ├── item.service.ts
 │   ├── addon.service.ts
 │   └── booking.service.ts
 ├── controllers/              # HTTP request handlers (thin layer)
 │   ├── category.controller.ts
 │   ├── item.controller.ts
 │   └── booking.controller.ts
 ├── middlewares/              # Express middleware
 │   ├── validate.middleware.ts
 │   ├── error-handler.middleware.ts
 │   └── logger.middleware.ts
 └── routes/                   # Express routes
     ├── category.routes.ts
     ├── item.routes.ts
     ├── booking.routes.ts
     └── index.ts
```

### Layer Responsibilities

**Controllers**: HTTP-specific logic only. No business rules.  
**Services**: All business logic, validation, and orchestration.  
**Repositories**: Direct MongoDB operations only.  
**Utils**: Reusable, testable business logic (pricing, tax, availability).

---

## Business Logic Highlights

### 1. Tax Inheritance Strategy ⭐

**CRITICAL DESIGN DECISION**: Items NEVER store tax values.

Tax resolution flow:
```
Item → Check Subcategory tax override → Fallback to Category tax
```

**Why this matters:**
- ✅ Single source of truth
- ✅ Changing category tax automatically affects all items
- ✅ No data sync issues
- ✅ Subcategories can optionally override

**Implementation:**
```typescript
// Tax is resolved at runtime via tax-resolver.util.ts
const taxInfo = await resolveTax(item);
// Returns: { tax_applicable: boolean, tax_percentage: number, source: 'category' | 'subcategory' }
```

### 2. Pricing Engine ⭐

**CRITICAL DESIGN DECISION**: Prices are calculated dynamically, NEVER stored in DB.

#### Supported Pricing Types:

**A. Static Pricing**
```json
{
  "pricing_type": "static",
  "pricing_details": {
    "static_price": 100
  }
}
```

**B. Tiered Pricing** (quantity-based)
```json
{
  "pricing_type": "tiered",
  "pricing_details": {
    "tiers": [
      { "min_quantity": 1, "max_quantity": 10, "price_per_unit": 50 },
      { "min_quantity": 11, "max_quantity": 50, "price_per_unit": 45 }
    ]
  }
}
```
⚠️ Validation ensures no overlapping ranges

**C. Complimentary Pricing**
```json
{
  "pricing_type": "complimentary"
}
```
Always returns price = 0

**D. Discounted Pricing**
```json
{
  "pricing_type": "discounted",
  "pricing_details": {
    "discount": {
      "base_price": 100,
      "discount_type": "percentage",  // or "flat"
      "discount_value": 20
    }
  }
}
```
⚠️ Validation ensures final price never goes negative

**E. Dynamic Time-based Pricing**
```json
{
  "pricing_type": "dynamic_time_based",
  "pricing_details": {
    "time_windows": [
      {
        "day_of_week": "monday",
        "start_time": "09:00",
        "end_time": "12:00",
        "price": 80
      },
      {
        "day_of_week": "monday",
        "start_time": "18:00",
        "end_time": "22:00",
        "price": 120
      }
    ],
    "unavailable_outside_windows": false
  }
}
```
⚠️ Validation prevents overlapping time windows

**Critical Endpoint:**
```
GET /api/v1/items/:id/price?quantity=5&addon_ids=xxx,yyy
```

Response includes:
- `base_price` - Calculated based on pricing type
- `applied_rule` - Which rule was used
- `tax_amount` - Calculated via inheritance
- `addons_total` - Sum of selected addons
- `final_price` - Complete payable amount

### 3. Booking Conflict Prevention ⭐

**Two-tier approach:**

**1. With MongoDB Replica Set (preferred):**
```typescript
// Uses MongoDB transactions for atomic booking creation
session.startTransaction();
// Check conflicts
// Create booking
session.commitTransaction();
```

**2. Without Replica Set (fallback):**
```typescript
// Optimistic locking with double-check before insert
// Check conflicts just before creating
await bookingRepo.create(data);
```

**Conflict detection query:**
```typescript
// Finds bookings with overlapping time slots
{
  item_id,
  date: { $gte: startOfDay, $lte: endOfDay },
  status: { $in: ['pending', 'confirmed'] },
  $or: [
    { start_time: { $lte: endTime }, end_time: { $gte: startTime } }
  ]
}
```

### 4. Soft Delete with Cascading

Deleting a category soft-deletes:
- All subcategories of that category
- All items in those subcategories

**Implementation:**
```typescript
// Category service
await categoryRepo.softDelete(id);
const subcategories = await subcategoryRepo.findByCategory(id);
for (const sub of subcategories) {
  await subcategoryRepo.softDelete(sub._id);
  await itemRepo.softDeleteBySubcategory(sub._id);
}
```

In all APIs, inactive entities are filtered out using `is_active: true`.

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Testing**: Jest
- **Development**: Nodemon, ts-node
- **Code Quality**: ESLint, Prettier

---

## Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 5.0 (standalone or replica set)
- npm >= 9.0.0

### Steps

```bash
# Clone repository
cd menu-services

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI
```

---

## Configuration

Edit `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/menu-services

# For transactions (replica set):
# MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/menu-services?replicaSet=rs0

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Testing
```bash
npm test
npm run test:watch
```

---

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### Categories

```http
POST   /api/v1/categories          # Create category
GET    /api/v1/categories          # List categories (paginated)
GET    /api/v1/categories/:id      # Get category by ID
PUT    /api/v1/categories/:id      # Update category
DELETE /api/v1/categories/:id      # Soft delete (cascades)
```

**Create Category:**
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Course",
    "description": "Main dishes",
    "tax_applicable": true,
    "tax_percentage": 18
  }'
```

#### Items

```http
POST   /api/v1/items                    # Create item
GET    /api/v1/items                    # List items (search, filter, paginate)
GET    /api/v1/items/:id                # Get item by ID
GET    /api/v1/items/:id/price          # ⭐ Get dynamic price with tax
GET    /api/v1/items/:id/with-addons    # Get item with grouped addons
PUT    /api/v1/items/:id                # Update item
DELETE /api/v1/items/:id                # Soft delete
```

**Get Item Price (Critical Endpoint):**
```bash
curl "http://localhost:3000/api/v1/items/673abc123def/price?quantity=5"
```

Response:
```json
{
  "success": true,
  "data": {
    "item_id": "673abc123def",
    "item_name": "Conference Room A",
    "pricing_type": "tiered",
    "base_price": 45,
    "applied_rule": "Tier: 1-10 units @ 45 per unit",
    "discount_amount": 0,
    "addons_total": 0,
    "subtotal": 225,
    "tax_info": {
      "tax_applicable": true,
      "tax_percentage": 18,
      "source": "category"
    },
    "tax_amount": 40.5,
    "final_price": 265.5
  }
}
```

#### Bookings

```http
POST   /api/v1/bookings                           # Create booking
GET    /api/v1/bookings                           # List bookings
GET    /api/v1/bookings/available-slots/:item_id  # Get available slots
GET    /api/v1/bookings/:id                       # Get booking by ID
PUT    /api/v1/bookings/:id                       # Update booking
POST   /api/v1/bookings/:id/cancel                 # Cancel booking
```

**Get Available Slots:**
```bash
curl "http://localhost:3000/api/v1/bookings/available-slots/673abc123def?date=2026-01-20"
```

**Create Booking:**
```bash
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "673abc123def",
    "user_email": "user@example.com",
    "user_name": "John Doe",
    "date": "2026-01-20",
    "start_time": "10:00",
    "end_time": "12:00",
    "notes": "Team meeting"
  }'
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm test -- --coverage
```

**Test coverage includes:**
- ✅ Tax inheritance edge cases
- ✅ All 5 pricing types
- ✅ Booking conflict scenarios
- ✅ Validation schemas

---

## Docker Support

### Build Image
```bash
docker build -t menu-services .
```

### Run with Docker Compose
```bash
docker-compose up
```

Includes:
- Application container
- MongoDB container (or replica set for transactions)

---

## Design Decisions

### 1. Why Tax Inheritance?

**Problem:** Updating tax rates would require updating thousands of items.

**Solution:** Items inherit tax from parent chain. Changing category tax instantly affects all items.

**Tradeoff:** Slightly more complex queries, but eliminates data sync issues.

### 2. Why Dynamic Pricing?

**Problem:** Storing calculated prices leads to stale data.

**Solution:** Calculate price on-demand using pricing engine.

**Tradeoff:** More computation per request, but guarantees real-time accuracy.

### 3. Why Soft Delete?

**Problem:** Hard deletes can break data integrity (e.g., booking references).

**Solution:** Use `is_active` flag and filter in queries.

**Tradeoff:** Database grows larger, but maintains referential integrity.

### 4. Why Booking Transactions?

**Problem:** Race conditions can cause double bookings.

**Solution:** Use MongoDB transactions when available; fallback to optimistic locking.

**Tradeoff:** Requires replica set for transactions, but prevents conflicts.

---

## Project Structure Decisions

### Why This Layer Architecture?

**Controllers** → HTTP-specific logic only  
**Services** → Business rules and orchestration  
**Repositories** → Database operations only  
**Utils** → Reusable, testable logic

**Benefits:**
- ✅ Easy to test (mock repositories in service tests)
- ✅ Business logic reusable across different interfaces (REST, GraphQL, gRPC)
- ✅ Database changes isolated to repositories
- ✅ Clear ownership of responsibilities

---

## Future Enhancements

- [ ] GraphQL API alongside REST
- [ ] Real-time notifications for booking conflicts
- [ ] Caching layer (Redis) for frequently accessed items
- [ ] Audit trail for tax changes
- [ ] Multi-tenancy support
- [ ] Advanced reporting endpoints

---

## License

MIT

---

## Author

Built with ❤️ as a production-grade demonstration of clean architecture principles.

**Key Takeaways:**
- Tax inheritance eliminates data duplication
- Dynamic pricing ensures real-time accuracy
- Transaction-based bookings prevent conflicts
- Clean architecture enables maintainability
