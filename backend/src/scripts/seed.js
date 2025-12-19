/**
 * Database Seed Script
 * 
 * This script:
 * 1. Deletes ALL existing data from the database
 * 2. Creates a new organization
 * 3. Creates an admin user (with SHA-256 hashed password)
 * 4. Creates multiple customers with subscriptions, transactions, and usage events
 * 
 * Usage: npm run seed (or node src/scripts/seed.js)
 */

import dotenv from 'dotenv'
import { connectDatabase } from '../config/database.js'
import Organization from '../models/Organization.js'
import AdminUser from '../models/AdminUser.js'
import Customer from '../models/Customer.js'
import Subscription from '../models/Subscription.js'
import Transaction from '../models/Transaction.js'
import UsageEvent from '../models/UsageEvent.js'
import crypto from 'crypto'

dotenv.config()

/**
 * Hash password with SHA-256 (same as frontend)
 */
function hashPasswordSHA256(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Generate random date within a range
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const seed = async () => {
  try {
    console.log('🔄 Connecting to database...')
    await connectDatabase()
    console.log('✅ Connected to database')

    // ============================================
    // STEP 1: DELETE ALL EXISTING DATA
    // ============================================
    console.log('\n🗑️  Deleting all existing data...')
    await UsageEvent.deleteMany({})
    await Transaction.deleteMany({})
    await Subscription.deleteMany({})
    await Customer.deleteMany({})
    await AdminUser.deleteMany({})
    await Organization.deleteMany({})
    console.log('✅ All existing data deleted')

    // ============================================
    // STEP 2: CREATE ORGANIZATION
    // ============================================
    console.log('\n🏢 Creating organization...')
    const organization = await Organization.create({
      name: 'MindMetrics Analytics',
      industry: 'SaaS',
      timezone: 'America/New_York',
      currency: 'USD',
      website: 'https://mindmetrics.com',
      address: '123 Business Street, San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      description: 'Leading SaaS analytics platform helping businesses track their performance metrics and customer insights.',
    })
    console.log(`✅ Created organization: ${organization.name}`)

    // ============================================
    // STEP 3: CREATE ADMIN USER
    // ============================================
    console.log('\n👤 Creating admin user...')
    // Hash password with SHA-256 (same as frontend does)
    const plainPassword = 'password123'
    const sha256HashedPassword = hashPasswordSHA256(plainPassword)
    
    // The AdminUser model will hash this SHA-256 hash with bcrypt for storage
    const adminUser = await AdminUser.create({
      organizationId: organization._id,
      name: 'Admin User',
      email: 'admin@mindmetrics.com',
      password: sha256HashedPassword, // SHA-256 hashed (will be bcrypt hashed by model)
      role: 'Owner',
    })
    console.log('✅ Created admin user')
    console.log(`   📧 Email: ${adminUser.email}`)
    console.log(`   🔑 Password: ${plainPassword}`)
    console.log(`   ⚠️  Note: Use this password to login (frontend will hash it with SHA-256)`)

    // ============================================
    // STEP 4: CREATE CUSTOMERS
    // ============================================
    console.log('\n👥 Creating customers...')
    const customerData = [
      { name: 'John Smith', email: 'john.smith@example.com', region: 'North America', status: 'active' },
      { name: 'Sarah Johnson', email: 'sarah.j@example.com', region: 'Europe', status: 'active' },
      { name: 'Michael Chen', email: 'michael.chen@example.com', region: 'Asia Pacific', status: 'active' },
      { name: 'Emily Davis', email: 'emily.davis@example.com', region: 'North America', status: 'active' },
      { name: 'David Wilson', email: 'david.wilson@example.com', region: 'Europe', status: 'active' },
      { name: 'Lisa Anderson', email: 'lisa.anderson@example.com', region: 'North America', status: 'active' },
      { name: 'Robert Brown', email: 'robert.brown@example.com', region: 'Asia Pacific', status: 'active' },
      { name: 'Jennifer Taylor', email: 'jennifer.taylor@example.com', region: 'Europe', status: 'active' },
      { name: 'James Martinez', email: 'james.martinez@example.com', region: 'North America', status: 'active' },
      { name: 'Maria Garcia', email: 'maria.garcia@example.com', region: 'Europe', status: 'active' },
      { name: 'William Lee', email: 'william.lee@example.com', region: 'Asia Pacific', status: 'active' },
      { name: 'Patricia White', email: 'patricia.white@example.com', region: 'North America', status: 'active' },
      { name: 'Richard Harris', email: 'richard.harris@example.com', region: 'Europe', status: 'inactive' },
      { name: 'Susan Clark', email: 'susan.clark@example.com', region: 'North America', status: 'active' },
      { name: 'Thomas Lewis', email: 'thomas.lewis@example.com', region: 'Asia Pacific', status: 'churned' },
    ]

    const customers = []
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

    for (const data of customerData) {
      const signupDate = randomDate(sixMonthsAgo, now)
      const lastActiveAt = data.status === 'churned' 
        ? randomDate(signupDate, new Date(signupDate.getTime() + 90 * 24 * 60 * 60 * 1000))
        : randomDate(signupDate, now)

      const customer = await Customer.create({
        organizationId: organization._id,
        name: data.name,
        email: data.email,
        status: data.status,
        region: data.region,
        signupDate,
        lastActiveAt,
      })
      customers.push(customer)
    }
    console.log(`✅ Created ${customers.length} customers`)

    // ============================================
    // STEP 5: CREATE SUBSCRIPTIONS
    // ============================================
    console.log('\n💳 Creating subscriptions...')
    const planDetails = {
      Free: { price: 0 },
      Basic: { price: 29 },
      Pro: { price: 99 },
    }

    const subscriptions = []
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i]
      let plan, price, status, startDate, endDate

      if (customer.status === 'churned') {
        // Churned customers have cancelled subscriptions
        plan = Math.random() > 0.5 ? 'Basic' : 'Pro'
        price = planDetails[plan].price
        status = 'cancelled'
        startDate = customer.signupDate
        endDate = customer.lastActiveAt
      } else if (customer.status === 'inactive') {
        // Inactive customers might be on trial or free plan
        plan = Math.random() > 0.5 ? 'Free' : 'Basic'
        price = planDetails[plan].price
        status = plan === 'Free' ? 'active' : 'trial'
        startDate = customer.signupDate
        endDate = null
      } else {
        // Active customers have active subscriptions
        const plans = ['Basic', 'Pro']
        plan = plans[Math.floor(Math.random() * plans.length)]
        price = planDetails[plan].price
        status = 'active'
        startDate = customer.signupDate
        endDate = null
      }

      const subscription = await Subscription.create({
        organizationId: organization._id,
        customerId: customer._id,
        plan,
        pricePerMonth: price,
        status,
        startDate,
        endDate,
      })
      subscriptions.push(subscription)
    }
    console.log(`✅ Created ${subscriptions.length} subscriptions`)

    // ============================================
    // STEP 6: CREATE TRANSACTIONS
    // ============================================
    console.log('\n💰 Creating transactions...')
    const transactions = []
    const currencies = ['USD', 'EUR', 'INR']

    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i]
      const customer = customers[i]

      // Only create transactions for paid plans
      if (subscription.pricePerMonth > 0 && subscription.status !== 'cancelled') {
        // Create multiple transactions (monthly payments)
        const monthsSinceStart = Math.floor(
          (now.getTime() - subscription.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
        )
        const transactionCount = Math.min(Math.max(monthsSinceStart, 1), 6) // 1-6 transactions

        for (let j = 0; j < transactionCount; j++) {
          const transactionDate = new Date(subscription.startDate)
          transactionDate.setMonth(transactionDate.getMonth() + j)

          // Some transactions might fail
          const status = Math.random() > 0.1 ? 'success' : 'failed'
          const currency = customer.region === 'Europe' ? 'EUR' : customer.region === 'Asia Pacific' ? 'INR' : 'USD'

          const transaction = await Transaction.create({
            organizationId: organization._id,
            customerId: customer._id,
            subscriptionId: subscription._id,
            amount: subscription.pricePerMonth,
            currency,
            status,
            createdAt: transactionDate,
          })
          transactions.push(transaction)
        }
      }
    }
    console.log(`✅ Created ${transactions.length} transactions`)

    // ============================================
    // STEP 7: CREATE USAGE EVENTS
    // ============================================
    console.log('\n📊 Creating usage events...')
    const usageEvents = []
    const eventTypes = ['login', 'session', 'feature_used']
    const features = ['dashboard', 'analytics', 'reports', 'settings', 'export', 'api']

    for (const customer of customers) {
      if (customer.status === 'churned') continue // Skip churned customers

      // Generate 5-15 usage events per active customer
      const eventCount = Math.floor(Math.random() * 11) + 5

      for (let i = 0; i < eventCount; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        const eventDate = randomDate(customer.signupDate, customer.lastActiveAt)

        const eventData = {
          organizationId: organization._id,
          customerId: customer._id,
          eventType,
          createdAt: eventDate,
        }

        if (eventType === 'session') {
          eventData.sessionDuration = Math.floor(Math.random() * 7200) + 300 // 5 min to 2 hours
        } else if (eventType === 'feature_used') {
          eventData.feature = features[Math.floor(Math.random() * features.length)]
        }

        const event = await UsageEvent.create(eventData)
        usageEvents.push(event)
      }
    }
    console.log(`✅ Created ${usageEvents.length} usage events`)

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50))
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!')
    console.log('='.repeat(50))
    console.log(`\n📊 Summary:`)
    console.log(`   🏢 Organizations: 1`)
    console.log(`   👤 Admin Users: 1`)
    console.log(`   👥 Customers: ${customers.length}`)
    console.log(`   💳 Subscriptions: ${subscriptions.length}`)
    console.log(`   💰 Transactions: ${transactions.length}`)
    console.log(`   📊 Usage Events: ${usageEvents.length}`)
    console.log(`\n🔐 Login Credentials:`)
    console.log(`   📧 Email: admin@mindmetrics.com`)
    console.log(`   🔑 Password: password123`)
    console.log(`\n⚠️  Note: The password will be hashed with SHA-256 by the frontend`)
    console.log(`   before being sent to the backend for authentication.`)
    console.log('\n' + '='.repeat(50))

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error seeding database:')
    console.error(error)
    process.exit(1)
  }
}

seed()
