import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Edit, Users as UsersIcon } from 'lucide-react'
import { customerApi } from '@/api/api'
import DataTable, { type Column } from '@/components/DataTable'
import UserDetailDrawer from '@/components/UserDetailDrawer'
import UserForm from '@/components/UserForm'
import type { User } from '@/types'
import { format } from 'date-fns'

export default function Users() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('signupDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, sortBy, sortOrder],
    queryFn: () =>
      customerApi.getCustomers({
        page,
        limit: 20,
        search,
        sortBy,
        sortOrder,
      }),
  })

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortBy(key)
    setSortOrder(order)
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (user) => {
        const plan = (user as any).plan || 'Free'
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              plan === 'Pro'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                : plan === 'Basic'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}
          >
            {plan}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        user.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : user.status === 'inactive'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      key: 'lastActiveAt',
      header: 'Last Active',
      sortable: true,
      render: (user) => format(new Date(user.lastActiveAt), 'MMM d, yyyy'),
    },
    {
      key: 'region',
      header: 'Region',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEditUser(user)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg text-sm font-medium transition-all"
            title="Edit user"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setSelectedUserId((user as any)._id || (user as any).id)}
            className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
            title="View details"
          >
            View
          </button>
        </div>
      ),
    },
  ]

  const handleAddUser = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingUser(null)
  }

  const handleFormSuccess = () => {
    // Form will close automatically, but we can add any additional logic here
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center space-x-3">
            <UsersIcon className="w-8 h-8 text-primary-600" />
            <span>Users</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view your customer base</p>
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-105 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 transition-all hover:shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // Reset to first page on search
            }}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={(data?.data || []).map((user: any) => ({
          ...user,
          id: user.id || user._id, // Ensure id field exists
        }))}
        loading={isLoading}
        onSort={handleSort}
        sortKey={sortBy}
        sortOrder={sortOrder}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 transition-all">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Showing <span className="font-bold text-gray-900 dark:text-white">{(data.page - 1) * data.pageSize + 1}</span> to{' '}
            <span className="font-bold text-gray-900 dark:text-white">{Math.min(data.page * data.pageSize, data.total)}</span> of{' '}
            <span className="font-bold text-gray-900 dark:text-white">{data.total}</span> users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

