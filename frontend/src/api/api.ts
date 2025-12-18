/**
 * Real API Service Layer
 * Makes HTTP requests to the backend API
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
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// Helper function for API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data
}

// ==================== AUTH APIs ====================

export const authApi = {
  /**
   * Register first admin user and create organization
   */
  register: async (data: {
    name: string
    email: string
    password: string
    organizationName: string
    industry?: string
  }) => {
    const response = await apiRequest<{
      token: string
      user: {
        _id: string
        name: string
        email: string
        role: string
        organizationId: string
      }
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response
  },

  /**
   * Login admin user
   */
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      token: string
      user: {
        _id: string
        name: string
        email: string
        role: string
        organizationId: string
      }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return response
  },

  /**
   * Get current authenticated user
   */
  getMe: async () => {
    return apiRequest<{
      _id: string
      name: string
      email: string
      role: string
      organizationId: {
        _id: string
        name: string
        industry: string
        timezone: string
        currency: string
      }
    }>('/auth/me')
  },
}

// ==================== ANALYTICS APIs ====================

export const analyticsApi = {
  /**
   * Get dashboard overview KPIs
   */
  getOverview: async (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    return apiRequest<{
      totalUsers: number
      activeUsers: number
      mrr: number
      monthlyRevenue: number
      conversionRate: number
    }>(`/analytics/overview?${params.toString()}`)
  },

  /**
   * Get trend data for charts
   */
  getTrends: async (
    metric: 'users' | 'revenue' | 'sessions',
    from?: string,
    to?: string,
    groupBy: 'day' | 'month' = 'day'
  ) => {
    const params = new URLSearchParams({
      metric,
      groupBy,
    })
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    return apiRequest<Array<{ date: string; value: number }>>(
      `/analytics/trends?${params.toString()}`
    )
  },

  /**
   * Get retention data
   */
  getRetention: async () => {
    return apiRequest<
      Array<{
        cohort: string
        usersSignedUp: number
        usersReturning: number
        retentionRate: number
      }>
    >('/analytics/retention')
  },
}

// ==================== CUSTOMER APIs ====================

export const customerApi = {
  /**
   * Get all customers with filtering and pagination
   */
  getCustomers: async (params?: {
    search?: string
    status?: string
    region?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.region) queryParams.append('region', params.region)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    return apiRequest<PaginatedResponse<User>>(
      `/customers?${queryParams.toString()}`
    )
  },

  /**
   * Get single customer with subscription and activity
   */
  getCustomer: async (id: string) => {
    return apiRequest<{
      customer: User
      subscriptions: Subscription[]
      recentActivity: UsageEvent[]
    }>(`/customers/${id}`)
  },

  /**
   * Create new customer
   */
  createCustomer: async (data: {
    name: string
    email: string
    region: string
    status?: string
  }) => {
    return apiRequest<User>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update customer
   */
  updateCustomer: async (id: string, data: Partial<User>) => {
    return apiRequest<User>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete customer (soft delete)
   */
  deleteCustomer: async (id: string) => {
    return apiRequest<{ _id: string }>(`/customers/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== SUBSCRIPTION APIs ====================

export const subscriptionApi = {
  /**
   * Get all subscriptions
   */
  getSubscriptions: async (params?: {
    status?: string
    plan?: string
    customerId?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.plan) queryParams.append('plan', params.plan)
    if (params?.customerId) queryParams.append('customerId', params.customerId)

    return apiRequest<Subscription[]>(
      `/subscriptions?${queryParams.toString()}`
    )
  },

  /**
   * Get single subscription
   */
  getSubscription: async (id: string) => {
    return apiRequest<Subscription>(`/subscriptions/${id}`)
  },

  /**
   * Create new subscription
   */
  createSubscription: async (data: {
    customerId: string
    plan: string
    pricePerMonth?: number
    status?: string
  }) => {
    return apiRequest<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update subscription
   */
  updateSubscription: async (id: string, data: Partial<Subscription>) => {
    return apiRequest<Subscription>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Cancel subscription
   */
  deleteSubscription: async (id: string) => {
    return apiRequest<Subscription>(`/subscriptions/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== TRANSACTION APIs ====================

export const transactionApi = {
  /**
   * Get all transactions
   */
  getTransactions: async (params?: {
    userId?: string
    subscriptionId?: string
    from?: string
    to?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.subscriptionId)
      queryParams.append('subscriptionId', params.subscriptionId)
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return apiRequest<PaginatedResponse<Transaction>>(
      `/transactions?${queryParams.toString()}`
    )
  },

  /**
   * Create new transaction
   */
  createTransaction: async (data: {
    subscriptionId: string
    amount: number
    currency?: string
    status?: string
  }) => {
    return apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ==================== USAGE EVENT APIs ====================

export const usageEventApi = {
  /**
   * Get usage events
   */
  getUsageEvents: async (params?: {
    userId?: string
    from?: string
    to?: string
    eventType?: string
    feature?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    if (params?.eventType) queryParams.append('eventType', params.eventType)
    if (params?.feature) queryParams.append('feature', params.feature)

    return apiRequest<UsageEvent[]>(
      `/usage-events?${queryParams.toString()}`
    )
  },

  /**
   * Create usage event
   */
  createUsageEvent: async (data: {
    customerId: string
    eventType: string
    feature?: string
    sessionDuration?: number
  }) => {
    return apiRequest<UsageEvent>('/usage-events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ==================== REPORT APIs ====================

export const reportApi = {
  /**
   * Get all reports
   */
  getReports: async (params?: { type?: string; status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)

    return apiRequest<Report[]>(`/reports?${queryParams.toString()}`)
  },

  /**
   * Generate new report
   */
  generateReport: async (data: {
    type: string
    periodStart: string
    periodEnd: string
  }) => {
    return apiRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Download report file
   */
  downloadReport: async (id: string, format: 'csv' | 'json' = 'csv') => {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/reports/${id}/download?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download report')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${id}.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}

// ==================== SETTINGS APIs ====================

export const settingsApi = {
  /**
   * Get organization settings
   */
  getOrganization: async () => {
    return apiRequest<Account>('/settings/organization')
  },

  /**
   * Update organization settings
   */
  updateOrganization: async (data: Partial<Account>) => {
    return apiRequest<Account>('/settings/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

