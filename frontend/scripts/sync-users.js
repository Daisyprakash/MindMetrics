/**
 * Node.js script to sync localStorage data to JSON file
 * Run this script manually if needed: node scripts/sync-users.js
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const usersFilePath = path.resolve(__dirname, '../src/mock/data/users-custom.json')

// This script can be used to manually sync data if needed
// In normal operation, the Vite plugin handles this automatically

console.log('User data file location:', usersFilePath)

if (fs.existsSync(usersFilePath)) {
  const data = fs.readFileSync(usersFilePath, 'utf-8')
  const users = JSON.parse(data)
  console.log(`Found ${users.length} users in file`)
} else {
  console.log('User data file does not exist yet. It will be created when you add your first user.')
}

