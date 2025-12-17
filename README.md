# SaaS Analytics Dashboard

A full-stack B2B SaaS Analytics & Operations Platform for tracking customer metrics, revenue, subscriptions, and usage analytics.

## Project Structure

```
.
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express + MongoDB backend API
└── README.md          # This file
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection:
```
MONGODB_URI=mongodb://localhost:27017/saas-analytics
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

4. Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## First Time Setup

1. **Start MongoDB** (if using local MongoDB)

2. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Register First User**:
   - Navigate to `http://localhost:5173/login`
   - Click "Don't have an account? Register"
   - Fill in the registration form:
     - Name
     - Organization Name
     - Industry
     - Email
     - Password (min 6 characters)
   - This creates your organization and first admin user

5. **Or Use Seed Data**:
   - Run `npm run seed` in the backend directory
   - Login with:
     - Email: `admin@example.com`
     - Password: `password123`

## Features

### Backend
- RESTful API with Express
- MongoDB database with Mongoose
- JWT authentication
- CRUD operations for all entities
- Analytics and reporting endpoints
- CORS enabled

### Frontend
- React + TypeScript
- TanStack Query for data fetching
- React Router for navigation
- Tailwind CSS for styling
- Dark mode support
- Responsive design

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React
- TypeScript
- Vite
- TanStack Query
- React Router
- Tailwind CSS
- Recharts
- Lucide React

## API Documentation

See `backend/README.md` for detailed API documentation.

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/saas-analytics
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Development

### Backend
- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
