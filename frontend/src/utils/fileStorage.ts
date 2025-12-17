/**
 * File Storage utilities for all entities
 * Handles reading/writing to JSON files for persistence
 */

import type { User, Subscription, Transaction, UsageEvent, Report, Account } from '@/types'

const DATA_DIR = '/src/mock/data'
const API_BASE = import.meta.env.DEV ? '' : ''

// Generic file storage functions
async function readFromFile<T>(filename: string): Promise<T[]> {
  try {
    const response = await fetch(`${DATA_DIR}/${filename}?t=${Date.now()}`)
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.warn(`Could not load ${filename}:`, error)
  }
  return []
}

async function writeToFile<T>(filename: string, data: T[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/write-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, data }),
    })
    return response.ok
  } catch (error) {
    console.warn(`Could not write ${filename}:`, error)
    return false
  }
}

// ============================================================================
// USERS
// ============================================================================

export const getUsersFromFile = (): Promise<User[]> => {
  return readFromFile<User>('users-custom.json')
}

export const saveUsersToFile = (users: User[]): Promise<boolean> => {
  return writeToFile<User>('users-custom.json', users)
}

// ============================================================================
// ACCOUNT
// ============================================================================

export const getAccountFromFile = async (): Promise<Account | null> => {
  try {
    const response = await fetch(`${DATA_DIR}/account.json?t=${Date.now()}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Could not load account:', error)
  }
  return null
}

export const saveAccountToFile = async (account: Account): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/write-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename: 'account.json', data: account }),
    })
    return response.ok
  } catch (error) {
    console.warn('Could not write account:', error)
    return false
  }
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const getSubscriptionsFromFile = (): Promise<Subscription[]> => {
  return readFromFile<Subscription>('subscriptions.json')
}

export const saveSubscriptionsToFile = (subscriptions: Subscription[]): Promise<boolean> => {
  return writeToFile<Subscription>('subscriptions.json', subscriptions)
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const getTransactionsFromFile = (): Promise<Transaction[]> => {
  return readFromFile<Transaction>('transactions.json')
}

export const saveTransactionsToFile = (transactions: Transaction[]): Promise<boolean> => {
  return writeToFile<Transaction>('transactions.json', transactions)
}

// ============================================================================
// USAGE EVENTS
// ============================================================================

export const getUsageEventsFromFile = (): Promise<UsageEvent[]> => {
  return readFromFile<UsageEvent>('usageEvents.json')
}

export const saveUsageEventsToFile = (events: UsageEvent[]): Promise<boolean> => {
  return writeToFile<UsageEvent>('usageEvents.json', events)
}

// ============================================================================
// REPORTS
// ============================================================================

export const getReportsFromFile = (): Promise<Report[]> => {
  return readFromFile<Report>('reports.json')
}

export const saveReportsToFile = (reports: Report[]): Promise<boolean> => {
  return writeToFile<Report>('reports.json', reports)
}

