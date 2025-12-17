/**
 * Vite plugin to handle file writes for user data persistence
 */
import { Plugin } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function fileWriterPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'src/mock/data')
  
  // Ensure directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Initialize files if they don't exist
  const files = [
    'users-custom.json',
    'account.json',
    'subscriptions.json',
    'transactions.json',
    'usageEvents.json',
    'reports.json',
  ]

  files.forEach((file) => {
    const filePath = path.join(dataDir, file)
    if (!fs.existsSync(filePath)) {
      if (file === 'account.json') {
        fs.writeFileSync(
          filePath,
          JSON.stringify({
            id: 'acc_001',
            name: 'Acme Corporation',
            industry: 'SaaS',
            createdAt: new Date().toISOString(),
            timezone: 'America/New_York',
            currency: 'USD',
            plan: 'Pro',
          }, null, 2),
          'utf-8'
        )
      } else {
        fs.writeFileSync(filePath, '[]', 'utf-8')
      }
    }
  })

  return {
    name: 'file-writer',
    configureServer(server) {
      // Serve all JSON files from data directory
      server.middlewares.use('/src/mock/data', (req, res, next) => {
        if (req.method === 'GET') {
          const fileName = req.url?.split('/').pop()?.split('?')[0]
          if (fileName && files.includes(fileName)) {
            try {
              const filePath = path.join(dataDir, fileName)
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Cache-Control', 'no-cache')
                res.statusCode = 200
                res.end(data)
              } else {
                res.statusCode = 404
                res.end(fileName === 'account.json' ? '{}' : '[]')
              }
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(error) }))
            }
          } else {
            next()
          }
        } else {
          next()
        }
      })

      // Handle writing any file
      server.middlewares.use('/api/write-file', (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end('Method not allowed')
          return
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })

        req.on('end', () => {
          try {
            const { filename, data } = JSON.parse(body)
            
            if (!filename || !files.includes(filename)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Invalid filename' }))
              return
            }

            const filePath = path.join(dataDir, filename)
            
            // Ensure directory exists
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true })
            }

            // Write to file
            const content = Array.isArray(data) 
              ? JSON.stringify(data, null, 2)
              : JSON.stringify(data, null, 2)
            fs.writeFileSync(filePath, content, 'utf-8')
            
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: String(error) }))
          }
        })
      })

      // Legacy endpoint for backward compatibility
      server.middlewares.use('/api/write-users', (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end('Method not allowed')
          return
        }

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })

        req.on('end', () => {
          try {
            const users = JSON.parse(body)
            const filePath = path.join(dataDir, 'users-custom.json')
            fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: String(error) }))
          }
        })
      })
    },
  }
}

