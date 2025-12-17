import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react'
import { getUsers, getTransactions, getUsageEvents, getAnalyticsData } from '@/api/mockApi'
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

  // Fetch all data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers({ pageSize: 1000 }),
  })

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: () => getTransactions({ dateRange }),
  })

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => getAnalyticsData({ dateRange }),
  })

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!usersData || !transactionsData || !analyticsData) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        monthlyRevenue: 0,
        conversionRate: 0,
      }
    }

    const totalUsers = usersData.total
    const sevenDaysAgo = subDays(new Date(), 7)
    const activeUsers = usersData.data.filter(
      (u) => new Date(u.lastActiveAt) >= sevenDaysAgo
    ).length

    const monthlyRevenue = transactionsData.data
      .filter((t) => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0)

    const paidUsers = usersData.data.filter((u) => {
      // Check if user has a paid subscription (simplified)
      return u.status === 'active'
    }).length

    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0

    return {
      totalUsers,
      activeUsers,
      monthlyRevenue,
      conversionRate,
    }
  }, [usersData, transactionsData, analyticsData])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analyticsData) return []
    return analyticsData.chartPoints.map((point) => ({
      date: point.date,
      users: point.users,
      revenue: point.revenue,
      sessions: point.sessions,
    }))
  }, [analyticsData])

  const isLoading = usersLoading || transactionsLoading || analyticsLoading

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
          title="Monthly Revenue"
          value={`$${kpis.monthlyRevenue.toLocaleString()}`}
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

