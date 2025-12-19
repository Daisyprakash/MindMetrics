/**
 * Database Seed Script - Large Scale Data Generation
 * 
 * This script:
 * 1. Deletes ALL existing data from the database
 * 2. Creates a new organization
 * 3. Creates an admin user (with SHA-256 hashed password)
 * 4. Creates 500 customers with subscriptions, transactions, and usage events
 * 5. Generates data spanning the last 6 months
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

/**
 * Generate random customer name
 */
function generateRandomName() {
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
    'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
    'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Frank', 'Christine', 'Gregory', 'Debra',
    'Raymond', 'Rachel', 'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Virginia',
    'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Julie',
    'Jose', 'Joyce', 'Henry', 'Victoria', 'Adam', 'Kelly', 'Douglas', 'Christina',
    'Nathan', 'Joan', 'Zachary', 'Evelyn', 'Kyle', 'Judith', 'Noah', 'Megan',
    'Ethan', 'Cheryl', 'Jeremy', 'Andrea', 'Walter', 'Hannah', 'Christian', 'Jacqueline',
    'Keith', 'Martha', 'Roger', 'Gloria', 'Terry', 'Teresa', 'Gerald', 'Sara',
    'Harold', 'Janice', 'Sean', 'Marie', 'Austin', 'Julia', 'Carl', 'Grace',
    'Arthur', 'Judy', 'Lawrence', 'Theresa', 'Dylan', 'Madison', 'Jesse', 'Beverly',
    'Jordan', 'Denise', 'Bryan', 'Marilyn', 'Billy', 'Amber', 'Joe', 'Danielle',
    'Bruce', 'Rose', 'Gabriel', 'Brittany', 'Logan', 'Diana', 'Albert', 'Abigail',
    'Alan', 'Jane', 'Juan', 'Lori', 'Wayne', 'Alexis', 'Roy', 'Marie',
    'Ralph', 'Olivia', 'Randy', 'Catherine', 'Eugene', 'Frances', 'Vincent', 'Christina',
    'Russell', 'Samantha', 'Louis', 'Deborah', 'Philip', 'Rachel', 'Bobby', 'Carolyn',
    'Johnny', 'Janet', 'Willie', 'Virginia', 'Howard', 'Maria', 'Earl', 'Heather',
  ]
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
    'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
    'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards',
    'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers',
    'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly',
    'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks',
    'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
    'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
    'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell',
    'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons',
    'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin',
    'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson',
    'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro',
    'Marshall', 'Owens', 'Harrison', 'Fernandez', 'Mcdonald', 'Woods', 'Washington', 'Kennedy',
    'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb', 'Tucker', 'Guzman',
    'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon', 'Mendez',
    'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt', 'Hicks',
    'Holmes', 'Palmer', 'Wagner', 'Black', 'Robertson', 'Boyd', 'Rose', 'Stone',
    'Salazar', 'Fox', 'Warren', 'Mills', 'Meyer', 'Rice', 'Schmidt', 'Garza',
    'Daniels', 'Ferguson', 'Nichols', 'Stephens', 'Soto', 'Weaver', 'Ryan', 'Gardner',
    'Payne', 'Grant', 'Dunn', 'Kelley', 'Spencer', 'Hawkins', 'Arnold', 'Pierce',
    'Vazquez', 'Hansen', 'Peters', 'Santos', 'Hart', 'Bradley', 'Knight', 'Elliott',
    'Cunningham', 'Duncan', 'Armstrong', 'Hudson', 'Carroll', 'Lane', 'Riley', 'Andrews',
    'Alvarado', 'Ray', 'Delgado', 'Berry', 'Perkins', 'Hoffman', 'Johnston', 'Matthews',
    'Pena', 'Richards', 'Contreras', 'Willis', 'Carpenter', 'Lawrence', 'Sandoval', 'Guerrero',
    'George', 'Chapman', 'Rios', 'Estrada', 'Ortega', 'Watkins', 'Greene', 'Nunez',
    'Wheeler', 'Valdez', 'Harper', 'Lynch', 'Meyer', 'Garza', 'Vargas', 'Watkins',
  ]
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

/**
 * Generate random email
 */
function generateRandomEmail(name) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com', 'business.io', 'enterprise.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const namePart = name.toLowerCase().replace(/\s+/g, '.')
  const randomNum = Math.floor(Math.random() * 1000)
  return `${namePart}${randomNum}@${domain}`
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
    const plainPassword = 'password123'
    const sha256HashedPassword = hashPasswordSHA256(plainPassword)
    
    const adminUser = await AdminUser.create({
      organizationId: organization._id,
      name: 'Admin User',
      email: 'admin@mindmetrics.com',
      password: sha256HashedPassword,
      role: 'Owner',
    })
    console.log('✅ Created admin user')
    console.log(`   📧 Email: ${adminUser.email}`)
    console.log(`   🔑 Password: ${plainPassword}`)

    // ============================================
    // STEP 4: CREATE 500 CUSTOMERS
    // ============================================
    console.log('\n👥 Creating 500 customers...')
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
    const statuses = ['active', 'active', 'active', 'active', 'inactive', 'churned'] // 66% active, 16% inactive, 16% churned

    const customers = []
    const BATCH_SIZE = 100 // Insert in batches for better performance

    for (let batch = 0; batch < 5; batch++) {
      const customerBatch = []
      for (let i = 0; i < BATCH_SIZE; i++) {
        const name = generateRandomName()
        const email = generateRandomEmail(name)
        const region = regions[Math.floor(Math.random() * regions.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const signupDate = randomDate(sixMonthsAgo, now)
        
        let lastActiveAt
        if (status === 'churned') {
          // Churned customers stopped being active 1-3 months after signup
          const churnDate = new Date(signupDate.getTime() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000)
          lastActiveAt = churnDate > now ? now : churnDate
        } else if (status === 'inactive') {
          // Inactive customers last active 2-4 months ago
          const inactiveDate = new Date(now.getTime() - (60 + Math.random() * 60) * 24 * 60 * 60 * 1000)
          lastActiveAt = inactiveDate < signupDate ? signupDate : inactiveDate
        } else {
          // Active customers active within last 30 days
          lastActiveAt = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now)
        }

        customerBatch.push({
          organizationId: organization._id,
          name,
          email,
          status,
          region,
          signupDate,
          lastActiveAt,
        })
      }
      const created = await Customer.insertMany(customerBatch)
      customers.push(...created)
      console.log(`   ✅ Created batch ${batch + 1}/5 (${customers.length} total customers)`)
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
        // Churned: 60% Basic, 40% Pro
        plan = Math.random() > 0.4 ? 'Basic' : 'Pro'
        price = planDetails[plan].price
        status = 'cancelled'
        startDate = customer.signupDate
        endDate = customer.lastActiveAt
      } else if (customer.status === 'inactive') {
        // Inactive: 40% Free, 40% Basic (trial), 20% Pro (trial)
        const rand = Math.random()
        if (rand < 0.4) {
          plan = 'Free'
          status = 'active'
        } else if (rand < 0.8) {
          plan = 'Basic'
          status = 'trial'
        } else {
          plan = 'Pro'
          status = 'trial'
        }
        price = planDetails[plan].price
        startDate = customer.signupDate
        endDate = null
      } else {
        // Active: 20% Free, 40% Basic, 40% Pro
        const rand = Math.random()
        if (rand < 0.2) {
          plan = 'Free'
        } else if (rand < 0.6) {
          plan = 'Basic'
        } else {
          plan = 'Pro'
        }
        price = planDetails[plan].price
        status = 'active'
        startDate = customer.signupDate
        endDate = null
      }

      subscriptions.push({
        organizationId: organization._id,
        customerId: customer._id,
        plan,
        pricePerMonth: price,
        status,
        startDate,
        endDate,
      })
    }

    // Insert subscriptions in batches
    const subscriptionBatches = []
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      subscriptionBatches.push(subscriptions.slice(i, i + BATCH_SIZE))
    }

    const createdSubscriptions = []
    for (let i = 0; i < subscriptionBatches.length; i++) {
      const batch = await Subscription.insertMany(subscriptionBatches[i])
      createdSubscriptions.push(...batch)
      console.log(`   ✅ Created subscription batch ${i + 1}/${subscriptionBatches.length}`)
    }
    console.log(`✅ Created ${createdSubscriptions.length} subscriptions`)

    // ============================================
    // STEP 6: CREATE TRANSACTIONS
    // ============================================
    console.log('\n💰 Creating transactions...')
    const transactions = []
    let transactionCount = 0

    for (let i = 0; i < createdSubscriptions.length; i++) {
      const subscription = createdSubscriptions[i]
      const customer = customers[i]

      // Only create transactions for paid plans (Basic and Pro)
      if (subscription.pricePerMonth > 0) {
        // Calculate months since subscription started
        const monthsSinceStart = Math.floor(
          (now.getTime() - subscription.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
        )
        
        // Create monthly transactions up to subscription end or now
        const maxMonths = subscription.endDate 
          ? Math.floor((subscription.endDate.getTime() - subscription.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
          : Math.min(monthsSinceStart, 6) // Max 6 months for active subscriptions
        
        const transactionCountForSub = Math.max(1, maxMonths)

        for (let j = 0; j < transactionCountForSub; j++) {
          const transactionDate = new Date(subscription.startDate)
          transactionDate.setMonth(transactionDate.getMonth() + j)
          
          // Don't create future transactions
          if (transactionDate > now) break

          // 5% of transactions fail
          const status = Math.random() > 0.05 ? 'success' : 'failed'
          
          // Currency based on region
          let currency = 'USD'
          if (customer.region === 'Europe') currency = 'EUR'
          else if (customer.region === 'Asia Pacific') currency = 'INR'
          else if (customer.region === 'Latin America') currency = 'USD'
          else if (customer.region === 'Middle East') currency = 'USD'
          else if (customer.region === 'Africa') currency = 'USD'

          transactions.push({
            organizationId: organization._id,
            customerId: customer._id,
            subscriptionId: subscription._id,
            amount: subscription.pricePerMonth,
            currency,
            status,
            createdAt: transactionDate,
          })
          transactionCount++

          // Insert in batches of 1000
          if (transactions.length >= 1000) {
            await Transaction.insertMany(transactions)
            console.log(`   ✅ Created ${transactionCount} transactions...`)
            transactions.length = 0 // Clear array
          }
        }
      }
    }

    // Insert remaining transactions
    if (transactions.length > 0) {
      await Transaction.insertMany(transactions)
    }
    console.log(`✅ Created ${transactionCount} transactions`)

    // ============================================
    // STEP 7: CREATE USAGE EVENTS
    // ============================================
    console.log('\n📊 Creating usage events...')
    const eventTypes = ['login', 'session', 'feature_used']
    const features = ['dashboard', 'analytics', 'reports', 'settings', 'export', 'api']
    let usageEventCount = 0
    const usageEvents = []

    for (const customer of customers) {
      if (customer.status === 'churned') continue

      // Active customers: 20-50 events, Inactive: 5-15 events
      const eventCount = customer.status === 'active' 
        ? Math.floor(Math.random() * 31) + 20
        : Math.floor(Math.random() * 11) + 5

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

        usageEvents.push(eventData)
        usageEventCount++

        // Insert in batches of 1000
        if (usageEvents.length >= 1000) {
          await UsageEvent.insertMany(usageEvents)
          console.log(`   ✅ Created ${usageEventCount} usage events...`)
          usageEvents.length = 0
        }
      }
    }

    // Insert remaining usage events
    if (usageEvents.length > 0) {
      await UsageEvent.insertMany(usageEvents)
    }
    console.log(`✅ Created ${usageEventCount} usage events`)

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60))
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!')
    console.log('='.repeat(60))
    console.log(`\n📊 Summary:`)
    console.log(`   🏢 Organizations: 1`)
    console.log(`   👤 Admin Users: 1`)
    console.log(`   👥 Customers: ${customers.length}`)
    console.log(`   💳 Subscriptions: ${createdSubscriptions.length}`)
    console.log(`   💰 Transactions: ${transactionCount}`)
    console.log(`   📊 Usage Events: ${usageEventCount}`)
    console.log(`\n📅 Data Range: Last 6 months`)
    console.log(`\n🔐 Login Credentials:`)
    console.log(`   📧 Email: admin@mindmetrics.com`)
    console.log(`   🔑 Password: password123`)
    console.log('\n' + '='.repeat(60))

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error seeding database:')
    console.error(error)
    process.exit(1)
  }
}

seed()
