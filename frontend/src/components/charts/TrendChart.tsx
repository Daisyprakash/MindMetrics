import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'

export interface TrendChartData {
  date: string
  users?: number
  revenue?: number
  sessions?: number
}

interface TrendChartProps {
  data: TrendChartData[]
  metric: 'users' | 'revenue' | 'sessions'
  loading?: boolean
}

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'MMM d')
  } catch {
    return dateStr
  }
}

const formatValue = (value: number, metric: string) => {
  if (metric === 'revenue') {
    return `$${value.toLocaleString()}`
  }
  return value.toLocaleString()
}

export default function TrendChart({ data, metric, loading }: TrendChartProps) {
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

  const getMetricKey = () => {
    switch (metric) {
      case 'users':
        return 'users'
      case 'revenue':
        return 'revenue'
      case 'sessions':
        return 'sessions'
    }
  }

  const getMetricLabel = () => {
    switch (metric) {
      case 'users':
        return 'Users'
      case 'revenue':
        return 'Revenue'
      case 'sessions':
        return 'Sessions'
    }
  }

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {getMetricLabel()} Over Time
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatValue(value, metric)}
          />
          <Tooltip
            labelFormatter={(label) => formatDate(label as string)}
            formatter={(value: number) => formatValue(value, metric)}
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '8px',
              color: isDark ? '#f3f4f6' : '#111827',
            }}
          />
          <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
          <Line
            type="monotone"
            dataKey={getMetricKey()}
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={getMetricLabel()}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

