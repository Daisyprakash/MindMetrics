# SaaS Analytics Dashboard

A comprehensive B2B SaaS Analytics & Operations Platform built with React, TypeScript, and modern frontend tooling.

## 📁 Project Structure

```
.
├── frontend/          # All frontend code and configuration
│   ├── src/           # Source code
│   ├── package.json   # Dependencies
│   ├── scripts/       # Utility scripts
│   └── ...            # Frontend config files
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## 📊 Features

- **Authentication**: Login/Logout system
- **Dashboard**: Real-time KPIs and trend charts
- **Analytics**: Deep dive with filters and retention analysis
- **Users**: Full CRUD operations with search and pagination
- **Revenue**: MRR, ARR, churn tracking
- **Reports**: Generate and download reports
- **Settings**: Account management
- **Profile**: User profile page
- **Dark Mode**: Full dark mode support
- **Data Persistence**: All data stored in JSON files

## 🏗️ Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── api/          # API layer (mock)
│   ├── components/   # Reusable components
│   ├── contexts/     # React contexts (Auth, Theme)
│   ├── pages/        # Page components
│   ├── types/        # TypeScript definitions
│   ├── utils/        # Utility functions
│   └── mock/         # Mock data and generators
```

### Data Storage

All data is persisted in JSON files located in `frontend/src/mock/data/`:
- `users-custom.json` - User data
- `account.json` - Account settings
- `subscriptions.json` - Subscription data
- `transactions.json` - Transaction records
- `usageEvents.json` - Usage events
- `reports.json` - Generated reports

## 🧪 Testing Features

- **Generate Random Data**: Click "Generate Random" buttons in forms to auto-fill data
- **Seed Data**: All JSON files come with sample data for immediate testing

## 📝 Documentation

All documentation is located in the `frontend/` folder:
- `frontend/README.md` - Detailed frontend documentation
- `frontend/DATA_PERSISTENCE.md` - Data persistence guide
- `frontend/QUICK_START.md` - Quick start guide

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling

## 📄 License

This project is built for demonstration purposes.

---

**For detailed frontend documentation, see `frontend/README.md`**
