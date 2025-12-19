import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react'
import { analyticsApi } from '@/api/api'
import KPICard from '@/components/KPICard'
import TrendChart from '@/components/charts/TrendChart'
import { subDays } from 'date-fns'

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'sessions'>('users')
  const dateRange = useMemo(() => {
    // Use day boundaries in UTC for consistency with Analytics page and backend
    const now = new Date()
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))
    const fromDate = subDays(to, 30)
    const from = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate(), 0, 0, 0, 0))
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
            <span>Overview of your SaaS business performance</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={kpis.totalUsers.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          loading={isLoading}
          gradient="blue"
        />
        <KPICard
          title="Active Users (7d)"
          value={kpis.activeUsers.toLocaleString()}
          icon={<TrendingUp className="w-6 h-6" />}
          loading={isLoading}
          gradient="green"
        />
        <KPICard
          title="Monthly Recurring Revenue (MRR)"
          value={`$${kpis.mrr.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          loading={isLoading}
          gradient="purple"
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis.conversionRate.toFixed(1)}%`}
          icon={<Target className="w-6 h-6" />}
          loading={isLoading}
          gradient="orange"
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
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
        <TrendChart
          data={chartData}
          metric={selectedMetric}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

