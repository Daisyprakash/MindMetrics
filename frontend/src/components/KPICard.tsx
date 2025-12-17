import { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: ReactNode
  loading?: boolean
}

export default function KPICard({ title, value, change, icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm mt-2 ${
                change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}% vs previous period
            </p>
          )}
        </div>
        {icon && <div className="text-primary-500 dark:text-primary-400">{icon}</div>}
      </div>
    </div>
  )
}

