import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import type { User, UserStatus } from '@/types'
import { customerApi } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateRandomUserData } from '@/utils/randomData'

interface UserFormProps {
  user?: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']

export default function UserForm({ user, isOpen, onClose, onSuccess }: UserFormProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active' as UserStatus,
    region: 'North America',
    plan: 'Free',
    pricePerMonth: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditMode = !!user
  const userId = (user as any)?._id || user?.id

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        status: user.status,
        region: user.region,
        plan: 'Free', // Defaults for edit mode if not available in user object
        pricePerMonth: 0,
      })
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        status: 'active',
        region: 'North America',
        plan: 'Free',
        pricePerMonth: 0,
      })
    }
    setErrors({})
  }, [user, isOpen])

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email: string; region: string; status?: string; plan?: string; pricePerMonth?: number }) =>
      customerApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      onSuccess?.()
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<User>) => customerApi.updateCustomer(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', userId] })
      onSuccess?.()
      onClose()
    },
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    if (isEditMode) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleGenerateRandom = () => {
    if (isEditMode) return // Don't generate random data in edit mode
    
    const randomData = generateRandomUserData()
    const plans = ['Free', 'Basic', 'Pro']
    const plan = plans[Math.floor(Math.random() * plans.length)]
    const prices: Record<string, number> = { Free: 0, Basic: 29, Pro: 99 }
    
    setFormData({
      ...randomData,
      plan,
      pricePerMonth: prices[plan],
    })
    setErrors({}) // Clear any errors
  }

  if (!isOpen) return null

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Generate Random Button (only in add mode) */}
              {!isEditMode && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleGenerateRandom}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Random Data</span>
                  </button>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                  disabled={isLoading}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as UserStatus)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="churned">Churned</option>
                </select>
              </div>

              {/* Plan (Only in Add Mode) */}
              {!isEditMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subscription Plan
                    </label>
                    <select
                      value={formData.plan}
                      onChange={(e) => {
                        const plan = e.target.value
                        const prices: Record<string, number> = { Free: 0, Basic: 29, Pro: 99 }
                        setFormData(prev => ({ ...prev, plan, pricePerMonth: prices[plan] }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={isLoading}
                    >
                      <option value="Free">Free ($0)</option>
                      <option value="Basic">Basic ($29/mo)</option>
                      <option value="Pro">Pro ($99/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price per Month (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerMonth}
                      onChange={(e) => handleChange('pricePerMonth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={isLoading}
                      min="0"
                    />
                  </div>
                </>
              )}

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Messages */}
              {(createMutation.isError || updateMutation.isError) && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {isEditMode
                      ? 'Failed to update user. Please try again.'
                      : 'Failed to create user. Please try again.'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Update User'
                    : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
