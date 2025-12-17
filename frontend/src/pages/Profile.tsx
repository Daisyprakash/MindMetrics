import { useAuth } from '@/contexts/AuthContext'
import { User as UserIcon, Mail, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your account information</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 capitalize">{user.role}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{user.region}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Member since {format(new Date(user.signupDate), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded ${
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
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{user.subscriptionId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Signup Date</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {format(new Date(user.signupDate), 'MMMM d, yyyy HH:mm')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {format(new Date(user.lastActiveAt), 'MMMM d, yyyy HH:mm')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

