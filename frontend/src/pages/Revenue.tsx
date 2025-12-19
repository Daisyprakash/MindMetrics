import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, FileText } from 'lucide-react'
import { subscriptionApi, transactionApi } from '@/api/api'
import KPICard from '@/components/KPICard'
import DataTable, { type Column } from '@/components/DataTable'
import type { Transaction } from '@/types'
import { format } from 'date-fns'
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

export default function Revenue() {
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionApi.getSubscriptions(),
  })

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getTransactions({ limit: 100 }),
  })

  // Calculate MRR, ARR, Churn
  const revenueMetrics = useMemo(() => {
    if (!subscriptions || !transactionsData) {
      return { mrr: 0, arr: 0, churnRate: 0 }
    }

    // MRR = sum of all active subscription prices
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active')
    const mrr = activeSubscriptions.reduce((sum, s) => sum + s.pricePerMonth, 0)

    // ARR = MRR * 12
    const arr = mrr * 12

    // Churn rate = cancelled / total
    const totalSubscriptions = subscriptions.length
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'cancelled').length
    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0

    return { mrr, arr, churnRate }
  }, [subscriptions, transactionsData])

  // Transform backend data to match frontend types
  const transformedSubscriptions = useMemo(() => {
    if (!subscriptions) return []
    return subscriptions.map((s: any) => ({
      ...s,
      id: s._id || s.id,
      userId: s.customerId?._id || s.customerId || s.userId,
    }))
  }, [subscriptions])

  const transformedTransactions = useMemo(() => {
    if (!transactionsData?.data) return []
    return transactionsData.data.map((t: any) => ({
      ...t,
      id: t._id || t.id,
      userId: t.customerId?._id || t.customerId || t.userId,
      subscriptionId: t.subscriptionId?._id || t.subscriptionId || t.subscriptionId,
    }))
  }, [transactionsData])

  // Revenue by plan
  const revenueByPlan = useMemo(() => {
    if (!transformedSubscriptions) return []
    const planMap = new Map<string, number>()
    transformedSubscriptions
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        const current = planMap.get(s.plan) || 0
        planMap.set(s.plan, current + s.pricePerMonth)
      })
    return Array.from(planMap.entries()).map(([plan, revenue]) => ({
      plan,
      revenue,
    }))
  }, [transformedSubscriptions])

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (tx) => <span className="font-mono text-xs">{tx.id}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx) => (
        <span className="font-medium">
          ${tx.amount.toLocaleString()} {tx.currency}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            tx.status === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : tx.status === 'failed'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}
        >
          {tx.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (tx) => format(new Date(tx.createdAt), 'MMM d, yyyy'),
    },
  ]

  const isLoading = subscriptionsLoading || transactionsLoading

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-primary-600" />
          <span>Revenue</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your revenue metrics and transactions</p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Monthly Recurring Revenue (MRR)"
          value={`$${revenueMetrics.mrr.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          loading={isLoading}
          gradient="purple"
        />
        <KPICard
          title="Annual Recurring Revenue (ARR)"
          value={`$${revenueMetrics.arr.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          loading={isLoading}
          gradient="green"
        />
        <KPICard
          title="Churn Rate"
          value={`${revenueMetrics.churnRate.toFixed(1)}%`}
          icon={<TrendingDown className="w-6 h-6" />}
          loading={isLoading}
          gradient="orange"
        />
      </div>

      {/* Revenue by Plan Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue by Plan</h3>
        </div>
        {isLoading ? (
          <div className="animate-pulse h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueByPlan}>
              {(() => {
                const isDark = document.documentElement.classList.contains('dark')
                return (
                  <>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="plan" stroke={isDark ? '#9ca3af' : '#6b7280'} style={{ fontSize: '12px' }} />
                    <YAxis
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isDark ? '#f3f4f6' : '#111827',
                      }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
                    <Bar dataKey="revenue" fill="#0ea5e9" name="Monthly Revenue" />
                  </>
                )
              })()}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Transactions Table */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        <DataTable
          columns={transactionColumns}
          data={transformedTransactions.slice(0, 20)}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

