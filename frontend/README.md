# Frontend - SaaS Analytics Dashboard

This directory contains all frontend code and configuration for the SaaS Analytics Dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Structure

```
frontend/
├── src/
│   ├── api/              # Mock API layer
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── mock/              # Mock data and generators
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🛠️ Development

All development commands should be run from this `frontend/` directory.

## 📊 Data Files

Data is stored in `src/mock/data/`:
- `users-custom.json` - User data
- `account.json` - Account settings
- `subscriptions.json` - Subscription data
- `transactions.json` - Transaction records
- `usageEvents.json` - Usage events
- `reports.json` - Generated reports

## 🔧 Configuration

- **Vite**: `vite.config.ts`
- **TypeScript**: `tsconfig.json`, `tsconfig.node.json`
- **Tailwind**: `tailwind.config.js`
- **PostCSS**: `postcss.config.js`
- **ESLint**: `.eslintrc.cjs`

