/**
 * Mock API Layer
 * Simulates async API calls with artificial delays and error handling
 */

import type {
  User,
  Subscription,
  UsageEvent,
  Transaction,
  Report,
  Account,
  AnalyticsFilters,
  PaginatedResponse,
  SubscriptionPlan,
  UserStatus,
  UserRole,
} from '@/types'
import {
  getStoredUsers,
  saveUsers,
  addUserToStorage,
  updateUserInStorage,
  loadUsersFromFile,
} from '@/utils/localStorage'
import {
  getAccountFromFile,
  saveAccountToFile,
  getSubscriptionsFromFile,
  saveSubscriptionsToFile,
  getTransactionsFromFile,
  saveTransactionsToFile,
  getUsageEventsFromFile,
  saveUsageEventsToFile,
  getReportsFromFile,
  saveReportsToFile,
} from '@/utils/fileStorage'

// Initialize: Load users from file on module load
let fileUsersLoaded = false
let initializationPromise: Promise<void> | null = null

const initializeUsers = async (): Promise<void> => {
  if (!fileUsersLoaded) {
    await loadUsersFromFile()
    fileUsersLoaded = true
  }
}

// Start initialization immediately
initializationPromise = initializeUsers()

// Ensure initialization completes before getUsers is called
export const ensureUsersInitialized = async (): Promise<void> => {
  if (initializationPromise) {
    await initializationPromise
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const randomError = (chance: number = 0.05): void => {
  if (Math.random() < chance) {
    throw new Error('Simulated API error')
  }
}

// ============================================================================
// ACCOUNT API
// ============================================================================

export const getAccount = async (): Promise<Account> => {
  await delay(randomInt(200, 500))
  randomError(0.02)
  
  const account = await getAccountFromFile()
  if (account) {
    return account
  }
  
  // Default account if file doesn't exist
  const defaultAccount: Account = {
    id: 'acc_001',
    name: 'Acme Corporation',
    industry: 'SaaS',
    createdAt: new Date().toISOString(),
    timezone: 'America/New_York',
    currency: 'USD',
    plan: 'Pro',
  }
  
  await saveAccountToFile(defaultAccount)
  return defaultAccount
}

export const updateAccount = async (updates: Partial<Account>): Promise<Account> => {
  await delay(randomInt(300, 700))
  randomError(0.05)
  
  const currentAccount = await getAccount()
  const updatedAccount = { ...currentAccount, ...updates }
  await saveAccountToFile(updatedAccount)
  return updatedAccount
}

// ============================================================================
// USERS API
// ============================================================================

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export interface GetUsersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: UserStatus[]
  region?: string[]
  sortBy?: 'name' | 'email' | 'signupDate' | 'lastActiveAt'
  sortOrder?: 'asc' | 'desc'
}

// Get all users (from localStorage only - no mock data)
const getAllUsers = (): User[] => {
  return getStoredUsers()
}

export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  // Ensure file users are loaded first
  await ensureUsersInitialized()
  await delay(randomInt(300, 800))
  randomError(0.03)

  const {
    page = 1,
    pageSize = 20,
    search = '',
    status,
    region,
    sortBy = 'signupDate',
    sortOrder = 'desc',
  } = params

  let filtered = [...getAllUsers()]

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
    )
  }

  // Status filter
  if (status && status.length > 0) {
    filtered = filtered.filter((u) => status.includes(u.status))
  }

  // Region filter
  if (region && region.length > 0) {
    filtered = filtered.filter((u) => region.includes(u.region))
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    switch (sortBy) {
      case 'name':
        aVal = a.name
        bVal = b.name
        break
      case 'email':
        aVal = a.email
        bVal = b.email
        break
      case 'signupDate':
        aVal = new Date(a.signupDate).getTime()
        bVal = new Date(b.signupDate).getTime()
        break
      case 'lastActiveAt':
        aVal = new Date(a.lastActiveAt).getTime()
        bVal = new Date(b.lastActiveAt).getTime()
        break
      default:
        return 0
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = filtered.slice(start, end)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export const getUser = async (id: string): Promise<User | null> => {
  // Ensure file users are loaded first
  await ensureUsersInitialized()
  await delay(randomInt(200, 400))
  randomError(0.02)
  
  // Use getAllUsers to get merged list
  const allUsers = getAllUsers()
  return allUsers.find((u) => u.id === id) || null
}

export interface CreateUserData {
  name: string
  email: string
  role: UserRole
  status: UserStatus
  region: string
  subscriptionId?: string
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
  await delay(randomInt(300, 600))
  randomError(0.05)

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...userData,
    signupDate: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    subscriptionId: userData.subscriptionId || `sub_${Date.now()}`,
  }

  await addUserToStorage(newUser)
  return newUser
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  region?: string
  lastActiveAt?: string
}

export const updateUser = async (id: string, updates: UpdateUserData): Promise<User> => {
  await delay(randomInt(300, 600))
  randomError(0.05)

  // Get existing user
  const existingUser = await getUser(id)
  if (!existingUser) {
    throw new Error('User not found')
  }

  const updatedUser: User = {
    ...existingUser,
    ...updates,
  }

  // Check if user is in localStorage, if not, add it
  const storedUsers = getStoredUsers()
  const isStored = storedUsers.some((u) => u.id === id)
  
  if (isStored) {
    await updateUserInStorage(updatedUser)
  } else {
    // If it was a mock user, add it to storage
    await addUserToStorage(updatedUser)
  }

  return updatedUser
}

// ============================================================================
// SUBSCRIPTIONS API
// ============================================================================

export const getSubscriptions = async (): Promise<Subscription[]> => {
  await delay(randomInt(200, 500))
  randomError(0.03)
  return await getSubscriptionsFromFile()
}

export const getSubscription = async (id: string): Promise<Subscription | null> => {
  await delay(randomInt(200, 400))
  randomError(0.02)
  const subscriptions = await getSubscriptionsFromFile()
  return subscriptions.find((s) => s.id === id) || null
}

export const getSubscriptionsByUser = async (userId: string): Promise<Subscription[]> => {
  await delay(randomInt(200, 400))
  randomError(0.02)
  const subscriptions = await getSubscriptionsFromFile()
  return subscriptions.filter((s) => s.userId === userId)
}

// ============================================================================
// USAGE EVENTS API
// ============================================================================

export interface GetUsageEventsParams {
  userId?: string
  dateRange?: { from: string; to: string }
  eventType?: UsageEvent['eventType']
  feature?: UsageEvent['feature']
}

export const getUsageEvents = async (
  params: GetUsageEventsParams = {}
): Promise<UsageEvent[]> => {
  await delay(randomInt(300, 600))
  randomError(0.03)

  const allEvents = await getUsageEventsFromFile()
  let filtered = [...allEvents]

  if (params.userId) {
    filtered = filtered.filter((e) => e.userId === params.userId)
  }

  if (params.dateRange) {
    const from = new Date(params.dateRange.from)
    const to = new Date(params.dateRange.to)
    filtered = filtered.filter((e) => {
      const eventDate = new Date(e.timestamp)
      return eventDate >= from && eventDate <= to
    })
  }

  if (params.eventType) {
    filtered = filtered.filter((e) => e.eventType === params.eventType)
  }

  if (params.feature) {
    filtered = filtered.filter((e) => e.feature === params.feature)
  }

  return filtered.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

// ============================================================================
// TRANSACTIONS API
// ============================================================================

export interface GetTransactionsParams {
  userId?: string
  subscriptionId?: string
  dateRange?: { from: string; to: string }
  status?: Transaction['status']
  page?: number
  pageSize?: number
}

export const getTransactions = async (
  params: GetTransactionsParams = {}
): Promise<PaginatedResponse<Transaction>> => {
  await delay(randomInt(300, 700))
  randomError(0.03)

  const { page = 1, pageSize = 20 } = params

  const allTransactions = await getTransactionsFromFile()
  let filtered = [...allTransactions]

  if (params.userId) {
    filtered = filtered.filter((t) => t.userId === params.userId)
  }

  if (params.subscriptionId) {
    filtered = filtered.filter((t) => t.subscriptionId === params.subscriptionId)
  }

  if (params.dateRange) {
    const from = new Date(params.dateRange.from)
    const to = new Date(params.dateRange.to)
    filtered = filtered.filter((t) => {
      const txDate = new Date(t.createdAt)
      return txDate >= from && txDate <= to
    })
  }

  if (params.status) {
    filtered = filtered.filter((t) => t.status === params.status)
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = filtered.slice(start, end)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

// ============================================================================
// ANALYTICS API
// ============================================================================

export const getAnalyticsData = async (
  filters: AnalyticsFilters
): Promise<{
  chartPoints: Array<{ date: string; users: number; revenue: number; sessions: number }>
  retentionData: Array<{ cohort: string; usersSignedUp: number; usersReturning: number; retentionRate: number }>
}> => {
  await delay(randomInt(400, 800))
  randomError(0.04)

  const { dateRange } = filters
  const from = new Date(dateRange.from)
  const to = new Date(dateRange.to)

  // Generate chart points (daily aggregation)
  const chartPoints: Array<{ date: string; users: number; revenue: number; sessions: number }> = []
  const currentDate = new Date(from)

  while (currentDate <= to) {
    const dateStr = currentDate.toISOString().split('T')[0]
    
    // Count users active on this date
    const allUsers = getAllUsers()
    const usersOnDate = allUsers.filter((u) => {
      const lastActive = new Date(u.lastActiveAt).toISOString().split('T')[0]
      return lastActive === dateStr
    }).length

    // Calculate revenue for this date
    const allTransactions = await getTransactionsFromFile()
    const revenueOnDate = allTransactions
      .filter((t) => {
        const txDate = new Date(t.createdAt).toISOString().split('T')[0]
        return txDate === dateStr && t.status === 'success'
      })
      .reduce((sum, t) => sum + t.amount, 0)

    // Count sessions on this date
    const allEvents = await getUsageEventsFromFile()
    const sessionsOnDate = allEvents.filter((e) => {
      const eventDate = new Date(e.timestamp).toISOString().split('T')[0]
      return eventDate === dateStr && e.eventType === 'session_start'
    }).length

    chartPoints.push({
      date: dateStr,
      users: usersOnDate,
      revenue: revenueOnDate,
      sessions: sessionsOnDate,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Generate retention data (monthly cohorts)
  const retentionData: Array<{
    cohort: string
    usersSignedUp: number
    usersReturning: number
    retentionRate: number
  }> = []

  // Group users by signup month
  const cohorts = new Map<string, User[]>()
  const allUsers = getAllUsers()
  allUsers.forEach((user) => {
    const cohort = new Date(user.signupDate).toISOString().slice(0, 7) // YYYY-MM
    if (!cohorts.has(cohort)) {
      cohorts.set(cohort, [])
    }
    cohorts.get(cohort)!.push(user)
  })

  cohorts.forEach((users, cohort) => {
    const usersSignedUp = users.length
    // Simple retention: users active in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const usersReturning = users.filter(
      (u) => new Date(u.lastActiveAt) >= sevenDaysAgo
    ).length
    const retentionRate = usersSignedUp > 0 ? usersReturning / usersSignedUp : 0

    retentionData.push({
      cohort,
      usersSignedUp,
      usersReturning,
      retentionRate,
    })
  })

  return {
    chartPoints: chartPoints.sort((a, b) => a.date.localeCompare(b.date)),
    retentionData: retentionData.sort((a, b) => a.cohort.localeCompare(b.cohort)),
  }
}

// ============================================================================
// REPORTS API
// ============================================================================

export const getReports = async (): Promise<Report[]> => {
  await delay(randomInt(200, 500))
  randomError(0.03)
  return await getReportsFromFile()
}

export const generateReport = async (type: Report['type']): Promise<Report> => {
  await delay(randomInt(2000, 4000)) // Simulate longer processing
  randomError(0.1)

  const newReport: Report = {
    id: `report_${Date.now()}`,
    type,
    generatedAt: new Date().toISOString(),
    status: 'ready',
    metrics: ['users', 'revenue', 'churn', 'retention'],
  }

  const reports = await getReportsFromFile()
  reports.unshift(newReport)
  await saveReportsToFile(reports)
  return newReport
}

