/**
 * Utility functions to generate random data for testing
 */

import type { UserRole, UserStatus, SubscriptionPlan, SubscriptionStatus, TransactionStatus, UsageEventType, FeatureName, ReportType } from '@/types'

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer',
  'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara',
  'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
  'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
]

const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'example.com']

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']

const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ============================================================================
// USER DATA
// ============================================================================

export const generateRandomUserData = () => {
  const firstName = randomChoice(firstNames)
  const lastName = randomChoice(lastNames)
  const domain = randomChoice(domains)
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
  
  return {
    name: `${firstName} ${lastName}`,
    email,
    role: randomChoice<UserRole>(['Admin', 'Member', 'Viewer']),
    status: randomChoice<UserStatus>(['active', 'active', 'active', 'inactive', 'churned']), // Bias toward active, use 'churned' instead of 'suspended'
    region: randomChoice(regions),
  }
}

// ============================================================================
// SUBSCRIPTION DATA
// ============================================================================

export const generateRandomSubscriptionData = (userId: string) => {
  const plan = randomChoice<SubscriptionPlan>(['Free', 'Basic', 'Pro'])
  const planPrices: Record<SubscriptionPlan, number> = {
    Free: 0,
    Basic: 29,
    Pro: 99,
  }
  
  const status = plan === 'Free' 
    ? randomChoice<SubscriptionStatus>(['active', 'cancelled'])
    : randomChoice<SubscriptionStatus>(['active', 'active', 'trial', 'cancelled'])
  
  return {
    userId,
    plan,
    pricePerMonth: planPrices[plan],
    status,
    startDate: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
    ...(status === 'cancelled' && {
      endDate: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
    }),
  }
}

// ============================================================================
// TRANSACTION DATA
// ============================================================================

export const generateRandomTransactionData = (userId: string, subscriptionId: string, amount: number) => {
  return {
    userId,
    subscriptionId,
    amount,
    currency: 'USD',
    status: randomChoice<TransactionStatus>(['success', 'success', 'success', 'success', 'failed', 'refunded']),
    createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
  }
}

// ============================================================================
// USAGE EVENT DATA
// ============================================================================

export const generateRandomUsageEventData = (userId: string) => {
  const eventType = randomChoice<UsageEventType>(['login', 'feature_used', 'session_start'])
  const features: FeatureName[] = ['dashboard', 'analytics', 'reports', 'settings', 'api_access', 'export_data']
  
  return {
    userId,
    eventType,
    feature: eventType === 'feature_used' ? randomChoice(features) : undefined,
    timestamp: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
    sessionDuration: eventType === 'session_start' ? randomInt(300, 7200) : undefined,
  }
}

// ============================================================================
// REPORT DATA
// ============================================================================

export const generateRandomReportData = () => {
  return {
    type: randomChoice<ReportType>(['monthly', 'quarterly', 'custom']),
    generatedAt: new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ready' as const,
    metrics: randomChoice([
      ['users', 'revenue', 'churn', 'retention'],
      ['users', 'revenue'],
      ['users', 'revenue', 'churn', 'retention', 'engagement'],
    ]),
  }
}

