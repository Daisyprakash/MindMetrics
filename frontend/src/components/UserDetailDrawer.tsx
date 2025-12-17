import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getUser, getSubscriptionsByUser, getUsageEvents } from '@/api/mockApi'
import type { User } from '@/types'
import { format } from 'date-fns'

interface UserDetailDrawerProps {
  userId: string | null
  onClose: () => void
}

export default function UserDetailDrawer({ userId, onClose }: UserDetailDrawerProps) {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  })

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['user-subscriptions', userId],
    queryFn: () => getSubscriptionsByUser(userId!),
    enabled: !!userId,
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: () => getUsageEvents({ userId: userId! }),
    enabled: !!userId,
  })

  if (!userId) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {userLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : user ? (
            <>
              {/* Profile Section */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Profile</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        user.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : user.status === 'inactive'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Region</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.region}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Signup Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(user.signupDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Active</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(user.lastActiveAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Subscription Section */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Subscription</h3>
                {subscriptionsLoading ? (
                  <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ) : subscriptions && subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{sub.plan}</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            sub.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : sub.status === 'trial'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${sub.pricePerMonth}/month
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Started: {format(new Date(sub.startDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No subscription</p>
                )}
              </section>

              {/* Recent Activity */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h3>
                {activityLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentActivity.slice(0, 10).map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-xs"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {event.eventType}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        {event.feature && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1">Feature: {event.feature}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                )}
              </section>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">User not found</p>
          )}
        </div>
      </div>
    </>
  )
}

