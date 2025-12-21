# Maintenance Script Documentation

## Overview

The maintenance script automatically updates subscription and customer statuses based on business rules. This ensures your data stays current without manual intervention.

## What It Does

### 1. Subscription Status Updates
- **Expired Subscriptions**: If a subscription has an `endDate` in the past and is still marked as `'active'` or `'trial'`, it will be automatically marked as `'cancelled'`.

### 2. Customer Status Updates
- **Inactive Customers**: If a customer marked as `'active'` hasn't been active (no `lastActiveAt` update) in the last 7 days, they will be marked as `'inactive'`.
- **Reactivated Customers**: If a customer marked as `'inactive'` has been active in the last 7 days, they will be reactivated to `'active'`.

## Manual Execution

Run the script manually anytime:

```bash
npm run maintenance
```

## Automated Execution (Cron Job)

### Option 1: System Cron (Linux/Mac)

1. Open your crontab:
```bash
crontab -e
```

2. Add a line to run the script daily at 2 AM:
```bash
0 2 * * * cd /path/to/your/backend && npm run maintenance >> /path/to/logs/maintenance.log 2>&1
```

**Example with full path:**
```bash
0 2 * * * cd /home/user/saas-analytics/backend && /usr/bin/npm run maintenance >> /var/log/maintenance.log 2>&1
```

### Option 2: Node.js Cron Package (Recommended for Production)

Install `node-cron`:
```bash
npm install node-cron
```

Create a cron service in your server:

```javascript
// src/services/cron.js
import cron from 'node-cron'
import { runMaintenance } from '../scripts/maintenance.js'

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled maintenance...')
  await runMaintenance()
})
```

Then import it in your `server.js`:
```javascript
import './services/cron.js'
```

### Option 3: PM2 Cron (If using PM2)

Add to your `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'maintenance',
      script: 'npm',
      args: 'run maintenance',
      cron_restart: '0 2 * * *',
      autorestart: false,
    }
  ]
}
```

## Cron Schedule Examples

- **Daily at 2 AM**: `0 2 * * *`
- **Every 6 hours**: `0 */6 * * *`
- **Every hour**: `0 * * * *`
- **Every day at midnight**: `0 0 * * *`
- **Every Monday at 3 AM**: `0 3 * * 1`

## Logging

The script outputs to console. For cron jobs, redirect output to a log file:

```bash
0 2 * * * cd /path/to/backend && npm run maintenance >> /var/log/maintenance.log 2>&1
```

## Monitoring

Check the logs regularly to ensure the script is running:
```bash
tail -f /var/log/maintenance.log
```

## Testing

Before setting up cron, test the script manually:
```bash
npm run maintenance
```

You should see output like:
```
🔄 Starting maintenance script...
⏰ Time: 2024-01-15T02:00:00.000Z
✅ Updated 5 expired subscription(s) to 'cancelled'
✅ Updated 12 inactive customer(s) to 'inactive' status
✅ Reactivated 3 customer(s) to 'active' status

📊 Maintenance Summary:
   - Subscriptions updated: 5
   - Customers marked inactive: 12
   - Customers reactivated: 3
✅ Maintenance completed successfully!
```

## Troubleshooting

### Script doesn't run
- Check that Node.js and npm are in your PATH
- Verify the path to your backend directory is correct
- Check cron logs: `grep CRON /var/log/syslog` (Linux)

### Database connection errors
- Ensure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`
- Verify database credentials

### No updates happening
- This is normal if there are no records matching the criteria
- Check your data to verify subscriptions have `endDate` set
- Verify customers have `lastActiveAt` timestamps

## Customization

You can modify the inactivity threshold (currently 7 days) in `maintenance.js`:

```javascript
// Change from 7 days to 14 days
const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
```

## Security Notes

- Ensure the script has read/write access to your database
- Don't expose sensitive credentials in cron commands
- Use environment variables for all configuration
- Consider running the script as a non-root user

