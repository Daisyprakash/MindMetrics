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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto transition-all">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {isEditMode ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEditMode ? 'Update customer information' : 'Create a new customer account'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    errors.name
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:border-primary-500'
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    errors.email
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:border-primary-500'
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
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
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
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
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
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-105"
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
