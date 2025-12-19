# Database Seed Script

## Overview

The seed script (`src/scripts/seed.js`) completely clears the database and creates fresh test data with the new password format.

## What It Does

1. **Deletes ALL existing data** from:
   - Usage Events
   - Transactions
   - Subscriptions
   - Customers
   - Admin Users
   - Organizations

2. **Creates new data**:
   - 1 Organization (MindMetrics Analytics)
   - 1 Admin User (with SHA-256 hashed password)
   - 15 Customers (with various statuses and regions)
   - 15 Subscriptions (matching customers)
   - Multiple Transactions (monthly payments for paid plans)
   - Multiple Usage Events (5-15 per active customer)

## Usage

```bash
# From the backend directory
npm run seed

# Or directly
node src/scripts/seed.js
```

## Login Credentials

After running the seed script, you can login with:

- **Email**: `admin@mindmetrics.com`
- **Password**: `password123`

**Important**: The frontend will hash this password with SHA-256 before sending it to the backend. The backend will then hash it with bcrypt for storage.

## Data Details

### Organization
- Name: MindMetrics Analytics
- Industry: SaaS
- Timezone: America/New_York
- Currency: USD
- Includes website, address, phone, and description

### Customers
- 15 customers total
- Mix of statuses: active, inactive, churned
- Different regions: North America, Europe, Asia Pacific
- Random signup dates (within last 6 months)
- Realistic last active dates

### Subscriptions
- Each customer has 1 subscription
- Plans: Free ($0), Basic ($29), Pro ($99)
- Statuses match customer status
- Churned customers have cancelled subscriptions with end dates

### Transactions
- Only for paid plans (Basic and Pro)
- Multiple transactions per subscription (monthly payments)
- Mix of success and failed transactions
- Currency based on customer region

### Usage Events
- 5-15 events per active customer
- Event types: login, session, feature_used
- Random dates within customer's active period
- Session durations and feature names included

## Security Note

The seed script creates the admin user with a SHA-256 hashed password (matching what the frontend sends). The AdminUser model will then hash this with bcrypt for secure storage.

This ensures compatibility with the new authentication system where:
1. Frontend: SHA-256(password) → Network
2. Backend: bcrypt(SHA-256(password)) → Database

