# SaaS Analytics Dashboard - Backend API

Node.js + Express + MongoDB backend for the SaaS Analytics Dashboard.

## Features

- RESTful API with Express
- MongoDB database with Mongoose
- JWT authentication
- CRUD operations for all entities
- Analytics and reporting endpoints
- CORS enabled for frontend integration

## Setup

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/saas-analytics
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
FRONTEND_URL=http://localhost:5173
```

4. Seed the database (optional):
```bash
npm run seed
```

This creates:
- An organization
- An admin user (email: `admin@example.com`, password: `password123`)
- Sample customers, subscriptions, transactions, and usage events

5. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register first admin user and create organization
- `POST /api/auth/login` - Login admin user
- `GET /api/auth/me` - Get current authenticated user

### Analytics
- `GET /api/analytics/overview` - Get dashboard KPIs
- `GET /api/analytics/trends` - Get trend data for charts
- `GET /api/analytics/retention` - Get retention data

### Customers
- `GET /api/customers` - Get all customers (with filtering, pagination)
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (soft delete)

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get single subscription
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction

### Usage Events
- `GET /api/usage-events` - Get usage events
- `POST /api/usage-events` - Create usage event

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Generate new report

### Settings
- `GET /api/settings/organization` - Get organization settings
- `PUT /api/settings/organization` - Update organization settings

## Authentication

All endpoints except `/api/auth/*` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Models

- **Organization** - Company using the platform
- **AdminUser** - Owners/admins of the platform
- **Customer** - End users of the SaaS product being tracked
- **Subscription** - Customer subscription plans
- **Transaction** - Payment transactions
- **UsageEvent** - Customer activity events
- **Report** - Generated analytics reports

## Development

- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

