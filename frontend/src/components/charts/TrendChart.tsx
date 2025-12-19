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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px', fontWeight: 500 }}
          />
          <YAxis
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px', fontWeight: 500 }}
            tickFormatter={(value) => formatValue(value, metric)}
          />
          <Tooltip
            labelFormatter={(label) => formatDate(label as string)}
            formatter={(value: number) => formatValue(value, metric)}
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '12px',
              color: isDark ? '#f3f4f6' : '#111827',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '12px',
            }}
          />
          <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827', paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey={getMetricKey()}
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ r: 5, fill: '#0ea5e9' }}
            activeDot={{ r: 7, fill: '#0284c7' }}
            name={getMetricLabel()}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

