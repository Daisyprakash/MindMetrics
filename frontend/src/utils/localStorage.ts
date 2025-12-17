/**
 * LocalStorage utilities for persisting user data
 * Also syncs with JSON file via API for persistence between runs
 */

import type { User } from '@/types'

const USERS_STORAGE_KEY = 'saas_dashboard_users'

/**
 * Get all users from localStorage
 */
export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return []
  } catch (error) {
    console.error('Error reading users from localStorage:', error)
    return []
  }
}

/**
 * Save users to localStorage and sync to file
 */
export const saveUsers = async (users: User[]): Promise<void> => {
  try {
    // Save to localStorage immediately
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    
    // Sync to file via API (only in dev mode)
    if (import.meta.env.DEV) {
      try {
        await fetch('/api/write-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(users),
        })
      } catch (error) {
        console.warn('Failed to sync users to file (this is OK in production):', error)
      }
    }
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

/**
 * Add a new user to localStorage and sync to file
 */
export const addUserToStorage = async (user: User): Promise<void> => {
  const users = getStoredUsers()
  users.push(user)
  await saveUsers(users)
}

/**
 * Update a user in localStorage and sync to file
 */
export const updateUserInStorage = async (updatedUser: User): Promise<void> => {
  const users = getStoredUsers()
  const index = users.findIndex((u) => u.id === updatedUser.id)
  if (index !== -1) {
    users[index] = updatedUser
    await saveUsers(users)
  }
}

/**
 * Get a user by ID from localStorage
 */
export const getUserFromStorage = (id: string): User | null => {
  const users = getStoredUsers()
  return users.find((u) => u.id === id) || null
}

/**
 * Load users from JSON file (called on app startup)
 */
export const loadUsersFromFile = async (): Promise<User[]> => {
  try {
    // Try to fetch the JSON file via the dev server
    // In production, this would need to be served as a static asset
    const response = await fetch('/src/mock/data/users-custom.json?t=' + Date.now())
    if (response.ok) {
      const users = await response.json()
      if (Array.isArray(users)) {
        // Merge with localStorage (file takes priority for initial load)
        const existingUsers = getStoredUsers()
        const fileUserIds = new Set(users.map((u: User) => u.id))
        
        // Start with file users
        const merged = [...users]
        
        // Add localStorage users that aren't in file
        existingUsers.forEach((u) => {
          if (!fileUserIds.has(u.id)) {
            merged.push(u)
          }
        })
        
        // Save merged list back to localStorage
        if (merged.length > 0) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged))
        }
        return merged
      }
    }
  } catch (error) {
    // File might not exist yet, that's OK
    console.warn('Could not load users from file (this is OK on first run):', error)
  }
  return getStoredUsers()
}

