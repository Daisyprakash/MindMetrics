/**
 * Seed Script
 * Creates initial data for testing
 */
import dotenv from 'dotenv'
import { connectDatabase } from '../config/database.js'
import Organization from '../models/Organization.js'
import AdminUser from '../models/AdminUser.js'
import Customer from '../models/Customer.js'
import Subscription from '../models/Subscription.js'
import Transaction from '../models/Transaction.js'
import UsageEvent from '../models/UsageEvent.js'

dotenv.config()

const seed = async () => {
  try {
    await connectDatabase()

    // Clear existing data (optional - comment out in production)
    await Organization.deleteMany({})
    await AdminUser.deleteMany({})
    await Customer.deleteMany({})
    await Subscription.deleteMany({})
    await Transaction.deleteMany({})
    await UsageEvent.deleteMany({})

    // Create organization
    const organization = await Organization.create({
      name: 'Acme Corporation',
      industry: 'SaaS',
      timezone: 'America/New_York',
      currency: 'USD',
    })

    // Create admin user (Owner)
    const adminUser = await AdminUser.create({
      organizationId: organization._id,
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Owner',
    })

    console.log('✅ Created organization and admin user')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: password123')

    // Create sample customers
    const customers = await Customer.insertMany([
      {
        organizationId: organization._id,
        name: 'John Smith',
        email: 'john.smith@example.com',
        status: 'active',
        region: 'North America',
        signupDate: new Date('2024-01-15'),
        lastActiveAt: new Date(),
      },
      {
        organizationId: organization._id,
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        status: 'active',
        region: 'Europe',
        signupDate: new Date('2024-02-20'),
        lastActiveAt: new Date(),
      },
      {
        organizationId: organization._id,
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        status: 'inactive',
        region: 'Asia Pacific',
        signupDate: new Date('2024-03-10'),
        lastActiveAt: new Date('2024-11-20'),
      },
    ])

    // Create subscriptions
    const subscriptions = await Subscription.insertMany([
      {
        organizationId: organization._id,
        customerId: customers[0]._id,
        plan: 'Pro',
        pricePerMonth: 99,
        status: 'active',
        startDate: new Date('2024-01-15'),
      },
      {
        organizationId: organization._id,
        customerId: customers[1]._id,
        plan: 'Basic',
        pricePerMonth: 29,
        status: 'active',
        startDate: new Date('2024-02-20'),
      },
      {
        organizationId: organization._id,
        customerId: customers[2]._id,
        plan: 'Free',
        pricePerMonth: 0,
        status: 'cancelled',
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-11-20'),
      },
    ])

    // Create transactions
    await Transaction.insertMany([
      {
        organizationId: organization._id,
        customerId: customers[0]._id,
        subscriptionId: subscriptions[0]._id,
        amount: 99,
        currency: 'USD',
        status: 'success',
        createdAt: new Date('2024-12-01'),
      },
      {
        organizationId: organization._id,
        customerId: customers[1]._id,
        subscriptionId: subscriptions[1]._id,
        amount: 29,
        currency: 'USD',
        status: 'success',
        createdAt: new Date('2024-12-01'),
      },
    ])

    // Create usage events
    await UsageEvent.insertMany([
      {
        organizationId: organization._id,
        customerId: customers[0]._id,
        eventType: 'login',
        createdAt: new Date('2024-12-14'),
      },
      {
        organizationId: organization._id,
        customerId: customers[0]._id,
        eventType: 'session',
        sessionDuration: 3600,
        createdAt: new Date('2024-12-14'),
      },
      {
        organizationId: organization._id,
        customerId: customers[1]._id,
        eventType: 'feature_used',
        feature: 'dashboard',
        createdAt: new Date('2024-12-14'),
      },
    ])

    console.log('✅ Seed data created successfully!')
    console.log(`📊 Created ${customers.length} customers`)
    console.log(`💳 Created ${subscriptions.length} subscriptions`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()

