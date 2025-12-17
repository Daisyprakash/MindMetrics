/**
 * Main data generation
 * Generates all mock data in-memory for the API layer
 */

import {
  generateAccount,
  generateUsers,
  generateSubscriptions,
  generateUsageEvents,
  generateTransactions,
  generateReports,
} from './dataGenerator'

// Generate data
const account = generateAccount()
const users = generateUsers(150) // 150 users
const subscriptions = generateSubscriptions(users.map(u => u.id))
const usageEvents = generateUsageEvents(users.map(u => u.id), 5000) // 5000 events
const transactions = generateTransactions(subscriptions)
const reports = generateReports()

const data = {
  account,
  users,
  subscriptions,
  usageEvents,
  transactions,
  reports,
}

// Export for API layer
export default data

