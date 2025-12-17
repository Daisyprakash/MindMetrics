/**
 * Mock Data Generator
 * Generates realistic fake data for development
 */

import type {
  Account,
  User,
  Subscription,
  UsageEvent,
  Transaction,
  Report,
  SubscriptionPlan,
  UsageEventType,
  FeatureName,
} from '@/types'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const randomDate = (start: Date, end: Date): string => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
  return date.toISOString()
}

const daysAgo = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}


// ============================================================================
// ACCOUNT GENERATION
// ============================================================================

export const generateAccount = (): Account => {
  return {
    id: 'acc_001',
    name: 'Acme Corporation',
    industry: 'SaaS',
    createdAt: '2023-01-15T00:00:00.000Z',
    timezone: 'America/New_York',
    currency: 'USD',
    plan: 'Pro',
  }
}

// ============================================================================
// USER GENERATION
// ============================================================================

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

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']

const generateEmail = (name: string): string => {
  const domain = randomChoice(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'])
  return `${name.toLowerCase().replace(' ', '.')}@${domain}`
}

export const generateUsers = (count: number): User[] => {
  const users: User[] = []
  const subscriptionIds: string[] = []

  // Generate subscription IDs first
  for (let i = 0; i < count; i++) {
    subscriptionIds.push(`sub_${String(i + 1).padStart(3, '0')}`)
  }

  for (let i = 0; i < count; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const fullName = `${firstName} ${lastName}`
    const signupDate = randomDate(daysAgo(365), daysAgo(1))
    const lastActive = randomDate(new Date(signupDate), new Date())

    users.push({
      id: `user_${String(i + 1).padStart(3, '0')}`,
      name: fullName,
      email: generateEmail(fullName),
      role: randomChoice(['Admin', 'Member', 'Viewer']),
      status: randomChoice(['active', 'active', 'active', 'inactive', 'suspended']), // Bias toward active
      signupDate,
      lastActiveAt: lastActive,
      region: randomChoice(regions),
      subscriptionId: subscriptionIds[i],
    })
  }

  return users
}

// ============================================================================
// SUBSCRIPTION GENERATION
// ============================================================================

const planPrices: Record<SubscriptionPlan, number> = {
  Free: 0,
  Basic: 29,
  Pro: 99,
}

export const generateSubscriptions = (userIds: string[]): Subscription[] => {
  return userIds.map((userId, index) => {
    const plan = randomChoice(['Free', 'Basic', 'Pro'])
    const status = plan === 'Free' 
      ? randomChoice(['active', 'active', 'cancelled'])
      : randomChoice(['active', 'active', 'active', 'trial', 'cancelled'])
    
    const startDate = randomDate(daysAgo(365), daysAgo(1))
    const endDate = status === 'cancelled' 
      ? randomDate(new Date(startDate), new Date())
      : undefined

    return {
      id: `sub_${String(index + 1).padStart(3, '0')}`,
      userId,
      plan: plan as SubscriptionPlan,
      pricePerMonth: planPrices[plan as SubscriptionPlan],
      status: status as 'active' | 'cancelled' | 'trial',
      startDate,
      endDate,
    }
  })
}

// ============================================================================
// USAGE EVENT GENERATION
// ============================================================================

const features: FeatureName[] = [
  'dashboard',
  'analytics',
  'reports',
  'settings',
  'api_access',
  'export_data',
]

export const generateUsageEvents = (
  userIds: string[],
  count: number
): UsageEvent[] => {
  const events: UsageEvent[] = []

  for (let i = 0; i < count; i++) {
    const userId = randomChoice(userIds)
    const eventType = randomChoice<UsageEventType>(['login', 'feature_used', 'session_start'])
    const timestamp = randomDate(daysAgo(30), new Date())

    events.push({
      id: `event_${String(i + 1).padStart(6, '0')}`,
      userId,
      eventType,
      feature: eventType === 'feature_used' ? randomChoice(features) : undefined,
      timestamp,
      sessionDuration: eventType === 'session_start' ? randomInt(300, 7200) : undefined,
    })
  }

  return events.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

// ============================================================================
// TRANSACTION GENERATION
// ============================================================================

export const generateTransactions = (
  subscriptions: Subscription[]
): Transaction[] => {
  const transactions: Transaction[] = []
  let transactionIndex = 1

  subscriptions.forEach((subscription) => {
    if (subscription.plan === 'Free') return

    // Generate monthly transactions for active subscriptions
    const startDate = new Date(subscription.startDate)
    const endDate = subscription.endDate 
      ? new Date(subscription.endDate)
      : new Date()

    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const status = randomChoice(['success', 'success', 'success', 'success', 'failed', 'refunded'])
      
      transactions.push({
        id: `txn_${String(transactionIndex++).padStart(6, '0')}`,
        userId: subscription.userId,
        subscriptionId: subscription.id,
        amount: subscription.pricePerMonth,
        currency: 'USD',
        status: status as 'success' | 'failed' | 'refunded',
        createdAt: currentDate.toISOString(),
      })

      // Move to next month
      currentDate = new Date(currentDate)
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  })

  return transactions.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

export const generateReports = (): Report[] => {
  const reports: Report[] = []
  const now = new Date()

  // Generate monthly reports for last 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
    reports.push({
      id: `report_${String(i + 1).padStart(3, '0')}`,
      type: 'monthly',
      generatedAt: date.toISOString(),
      status: 'ready',
      metrics: ['users', 'revenue', 'churn', 'retention'],
    })
  }

  return reports
}

