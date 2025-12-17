import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface RetentionData {
  cohort: string
  usersSignedUp: number
  usersReturning: number
  retentionRate: number
}

interface RetentionChartProps {
  data: RetentionData[]
  loading?: boolean
}

export default function RetentionChart({ data, loading }: RetentionChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-96 transition-colors">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    cohort: item.cohort,
    'Signed Up': item.usersSignedUp,
    'Returning': item.usersReturning,
    'Retention Rate': (item.retentionRate * 100).toFixed(1),
  }))

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        User Retention by Cohort
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis
            dataKey="cohort"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '8px',
              color: isDark ? '#f3f4f6' : '#111827',
            }}
          />
          <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
          <Bar dataKey="Signed Up" fill="#3b82f6" />
          <Bar dataKey="Returning" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

