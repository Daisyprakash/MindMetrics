import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subDays, format } from 'date-fns'
import { analyticsApi } from '@/api/api'
import TrendChart from '@/components/charts/TrendChart'
import RetentionChart from '@/components/charts/RetentionChart'

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  })

  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'sessions'>('users')

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'trends', selectedMetric, dateRange],
    queryFn: () =>
      analyticsApi.getTrends(
        selectedMetric,
        new Date(dateRange.from).toISOString(),
        new Date(dateRange.to).toISOString(),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Deep dive into your business metrics</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Date Range</h3>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trends Over Time</h2>
          <div className="flex space-x-2">
            {(['users', 'revenue', 'sessions'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedMetric === metric
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
      <div>
        <RetentionChart
          data={
            retentionData?.map((r) => ({
              cohort: r.cohort,
              retentionRate: r.retentionRate,
            })) || []
          }
          loading={isLoading}
        />
      </div>
    </div>
  )
}

