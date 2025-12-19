import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react'
import { analyticsApi } from '@/api/api'
import KPICard from '@/components/KPICard'
import TrendChart from '@/components/charts/TrendChart'
import { subDays, format } from 'date-fns'

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'sessions'>('users')
  const dateRange = useMemo(() => {
    const to = new Date()
    const from = subDays(to, 30)
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    }
  }, [])

  // Fetch overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: () => analyticsApi.getOverview(dateRange.from, dateRange.to),
  })

  // Fetch trends data
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'trends', selectedMetric, dateRange],
    queryFn: () =>
      analyticsApi.getTrends(selectedMetric, dateRange.from, dateRange.to, 'day'),
  })

  // KPIs from API
  const kpis = useMemo(() => {
    if (!overviewData) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        mrr: 0,
        conversionRate: 0,
      }
    }

    return {
      totalUsers: overviewData.totalUsers,
      activeUsers: overviewData.activeUsers,
      mrr: overviewData.mrr, // Use MRR instead of monthlyRevenue for consistency
      conversionRate: overviewData.conversionRate * 100, // Convert to percentage
    }
  }, [overviewData])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!trendsData) return []
    return trendsData.map((point) => ({
      date: point.date,
      users: selectedMetric === 'users' ? point.value : 0,
      revenue: selectedMetric === 'revenue' ? point.value : 0,
      sessions: selectedMetric === 'sessions' ? point.value : 0,
    }))
  }, [trendsData, selectedMetric])

  const isLoading = overviewLoading || trendsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your SaaS business performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={kpis.totalUsers.toLocaleString()}
          icon={<Users className="w-8 h-8" />}
          loading={isLoading}
        />
        <KPICard
          title="Active Users (7d)"
          value={kpis.activeUsers.toLocaleString()}
          icon={<TrendingUp className="w-8 h-8" />}
          loading={isLoading}
        />
        <KPICard
          title="Monthly Recurring Revenue (MRR)"
          value={`$${kpis.mrr.toLocaleString()}`}
          icon={<DollarSign className="w-8 h-8" />}
          loading={isLoading}
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis.conversionRate.toFixed(1)}%`}
          icon={<Target className="w-8 h-8" />}
          loading={isLoading}
        />
      </div>

      {/* Trend Chart */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trends</h2>
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
        <TrendChart
          data={chartData}
          metric={selectedMetric}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

