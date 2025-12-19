import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subDays, format } from 'date-fns'
import { BarChart3, TrendingUp, Activity, Calendar } from 'lucide-react'
import { analyticsApi } from '@/api/api'
import TrendChart from '@/components/charts/TrendChart'
import RetentionChart from '@/components/charts/RetentionChart'

export default function Analytics() {
  // Use same date calculation as Dashboard for consistency
  const initialDateRange = useMemo(() => {
    const to = new Date()
    const from = subDays(to, 30)
    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
    }
  }, [])

  const [dateRange, setDateRange] = useState(initialDateRange)

  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'sessions'>('users')

  // Convert date strings to ISO strings using UTC to match Dashboard and backend
  // This ensures both pages use identical date ranges
  const fromISO = useMemo(() => {
    // Parse date string and set to start of day in UTC
    // Format: 'yyyy-MM-dd' -> 'yyyy-MM-ddT00:00:00.000Z'
    const date = new Date(dateRange.from + 'T00:00:00.000Z')
    return date.toISOString()
  }, [dateRange.from])

  const toISO = useMemo(() => {
    // Parse date string and set to end of day in UTC
    // Format: 'yyyy-MM-dd' -> 'yyyy-MM-ddT23:59:59.999Z'
    const date = new Date(dateRange.to + 'T23:59:59.999Z')
    return date.toISOString()
  }, [dateRange.to])

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'trends', selectedMetric, dateRange.from, dateRange.to],
    queryFn: () =>
      analyticsApi.getTrends(
        selectedMetric,
        fromISO,
        toISO,
        'day'
      ),
  })

  const { data: retentionData, isLoading: retentionLoading } = useQuery({
    queryKey: ['analytics', 'retention'],
    queryFn: () => analyticsApi.getRetention(),
  })

  const chartData = useMemo(() => {
    if (!trendsData) return []
    return trendsData.map((point) => ({
      date: point.date,
      users: selectedMetric === 'users' ? point.value : 0,
      revenue: selectedMetric === 'revenue' ? point.value : 0,
      sessions: selectedMetric === 'sessions' ? point.value : 0,
    }))
  }, [trendsData, selectedMetric])

  const isLoading = trendsLoading || retentionLoading

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <span>Analytics</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Deep dive into your business metrics</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date Range</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span>Trends Over Time</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your key metrics</p>
          </div>
          <div className="flex space-x-2">
            {(['users', 'revenue', 'sessions'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedMetric === metric
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <TrendChart data={chartData} metric={selectedMetric} loading={isLoading} />
      </div>

      {/* Retention Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <span>User Retention</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cohort-based retention analysis</p>
        </div>
        <RetentionChart
          data={
            retentionData?.map((r) => ({
              cohort: r.cohort,
              usersSignedUp: r.usersSignedUp || 0,
              usersReturning: r.usersReturning || 0,
              retentionRate: r.retentionRate || 0,
            })) || []
          }
          loading={isLoading}
        />
      </div>
    </div>
  )
}

