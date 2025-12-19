/**
 * Core Business Entity Type Definitions
 * These represent the canonical schemas for all data in the system
 */

// ============================================================================
// ACCOUNT SCHEMA
// ============================================================================

export type Industry = 'SaaS' | 'Ecommerce' | 'Fintech'
export type Currency = 'USD' | 'EUR' | 'INR'
export type AccountPlan = 'Starter' | 'Pro' | 'Enterprise'

export interface Account {
  id: string
  name: string
  industry: Industry
  createdAt: string // ISODateString
  timezone: string
  currency: Currency
  plan: AccountPlan
}

// ============================================================================
// USER (END CUSTOMER) SCHEMA
// ============================================================================

export type UserRole = 'Admin' | 'Member' | 'Viewer'
export type UserStatus = 'active' | 'inactive' | 'churned' // Match backend enum: ['active', 'inactive', 'churned']

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  signupDate: string // ISODateString
  lastActiveAt: string // ISODateString
  region: string
  subscriptionId: string
}

// ============================================================================
// SUBSCRIPTION SCHEMA
// ============================================================================

export type SubscriptionPlan = 'Free' | 'Basic' | 'Pro'
export type SubscriptionStatus = 'active' | 'cancelled' | 'trial'

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  pricePerMonth: number
  status: SubscriptionStatus
  startDate: string // ISODateString
  endDate?: string // ISODateString (optional for active subscriptions)
}

// ============================================================================
// USAGE EVENT SCHEMA
// ============================================================================

export type UsageEventType = 'login' | 'feature_used' | 'session_start'
export type FeatureName = 
  | 'dashboard'
  | 'analytics'
  | 'reports'
  | 'settings'
  | 'api_access'
  | 'export_data'

export interface UsageEvent {
  id: string
  userId: string
  eventType: UsageEventType
  feature?: FeatureName
  timestamp: string // ISODateString
  sessionDuration?: number // in seconds
}

// ============================================================================
// TRANSACTION SCHEMA
// ============================================================================

export type TransactionStatus = 'success' | 'failed' | 'refunded'

export interface Transaction {
  id: string
  userId: string
  subscriptionId: string
  amount: number
  currency: string
  status: TransactionStatus
  createdAt: string // ISODateString
}

// ============================================================================
// REPORT SCHEMA
// ============================================================================

export type ReportType = 'monthly' | 'quarterly' | 'custom'
export type ReportStatus = 'pending' | 'ready'

export interface Report {
  id: string
  type: ReportType
  generatedAt: string // ISODateString
  status: ReportStatus
  metrics: string[]
}

// ============================================================================
// DERIVED / COMPUTED TYPES
// ============================================================================

export interface ChartPoint {
  date: string
  users: number
  revenue: number
  sessions: number
}

export interface AnalyticsFilters {
  dateRange: {
    from: string
    to: string
  }
  region?: string[]
  plan?: SubscriptionPlan[]
  userStatus?: UserStatus[]
}

export interface KPIMetrics {
  totalUsers: number
  activeUsers: number // last 7 days
  monthlyRevenue: number
  conversionRate: number // paidUsers / totalUsers
}

export interface RevenueMetrics {
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churnRate: number // cancelledSubscriptions / totalSubscriptions
}

export interface RetentionData {
  cohort: string // e.g., "2024-01"
  usersSignedUp: number
  usersReturning: number
  retentionRate: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
}

