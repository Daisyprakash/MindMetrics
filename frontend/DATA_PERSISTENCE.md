# Data Persistence Guide

## Overview

User data is now persisted in a local JSON file (`src/mock/data/users-custom.json`) so that it persists between different npm runs. The system uses a dual-storage approach:

1. **localStorage** - For immediate browser storage (fast access)
2. **JSON File** - For persistence between runs (persistent storage)

## How It Works

### Architecture

1. **On App Startup:**
   - The app loads users from `users-custom.json` file
   - Merges file data with localStorage data
   - File data takes priority (if same user exists in both)

2. **When Creating/Updating Users:**
   - Data is saved to localStorage immediately (for fast UI updates)
   - Data is synced to the JSON file via API endpoint (`/api/write-users`)
   - The Vite dev server middleware handles the file write

3. **Data Flow:**
   ```
   User Action → localStorage → API Call → JSON File
                      ↓
                  UI Updates (immediate)
   ```

### Files Involved

- `src/mock/data/users-custom.json` - The persistent storage file
- `vite-plugin-file-writer.ts` - Vite plugin that handles file writes
- `src/utils/localStorage.ts` - Storage utilities with file sync
- `src/api/mockApi.ts` - API layer that loads from file on startup

## Usage

### Normal Operation

Just use the app normally! When you:
- **Add a user**: Data is automatically saved to both localStorage and the JSON file
- **Edit a user**: Changes are automatically synced to the JSON file
- **Restart the app**: Users are automatically loaded from the JSON file

### Manual File Access

The JSON file is located at:
```
frontend/src/mock/data/users-custom.json
```

You can:
- View the file to see all persisted users
- Manually edit it (be careful with JSON syntax)
- Delete it to reset user data (it will be recreated on next user creation)

### Development vs Production

- **Development Mode**: File writes work automatically via Vite dev server
- **Production Mode**: File writes are disabled (browser security). Only localStorage is used.

## Troubleshooting

### Users Not Persisting

1. **Check if the file exists**: Look for `src/mock/data/users-custom.json`
2. **Check browser console**: Look for any errors related to file sync
3. **Verify Vite dev server is running**: File writes only work in dev mode
4. **Check file permissions**: Ensure the file/directory is writable

### File Not Updating

- The file is only updated when you add/edit users through the UI
- If you manually edit the file, refresh the app to see changes
- File writes happen asynchronously, so there might be a small delay

### Reset User Data

To reset all custom users:
1. Delete or empty `src/mock/data/users-custom.json`
2. Clear browser localStorage (optional)
3. Restart the app

## Technical Details

### Vite Plugin

The `fileWriterPlugin` provides:
- Middleware to serve the JSON file at `/src/mock/data/users-custom.json`
- API endpoint at `/api/write-users` to handle file writes
- Automatic file creation if it doesn't exist

### Storage Priority

When loading users:
1. File users (from `users-custom.json`)
2. localStorage users (not in file)
3. Mock data users (generated, not in file or localStorage)

When saving:
- localStorage is updated immediately
- File is updated via API call (async)

## Notes

- The JSON file is **not** included in production builds
- File writes only work in development mode (Vite dev server)
- In production, only localStorage persistence is available
- The file is automatically created when you add your first user

