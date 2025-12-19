import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Loader2, User, Building2, Globe, DollarSign, Mail, Phone, MapPin, Link as LinkIcon, FileText, Calendar } from 'lucide-react'
import { settingsApi } from '@/api/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Industry, Currency } from '@/types'
import { format } from 'date-fns'

const industries: Industry[] = ['SaaS', 'Ecommerce', 'Fintech']
const currencies: Currency[] = ['USD', 'EUR', 'INR']
const timezones = [
  'America/New_York', 'America/Los_Angeles', 'Europe/London', 
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
  'America/Chicago', 'America/Denver', 'Europe/Berlin', 'Asia/Dubai'
]

export default function Profile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isDirty, setIsDirty] = useState(false)

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => settingsApi.getOrganization(),
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 0, // Always consider data stale to refetch on login
    gcTime: 0, // Don't cache when component unmounts (gcTime replaces cacheTime in React Query v5)
  })

  const [formData, setFormData] = useState({
    // Organization fields
    name: '',
    industry: 'SaaS' as Industry,
    timezone: 'America/New_York',
    currency: 'USD' as Currency,
    website: '',
    address: '',
    phone: '',
    description: '',
  })

  useEffect(() => {
    if (organization && typeof organization === 'object' && 'name' in organization) {
      const org = organization as any
      setFormData({
        name: org.name || '',
        industry: (org.industry as Industry) || 'SaaS',
        timezone: org.timezone || 'America/New_York',
        currency: (org.currency as Currency) || 'USD',
        website: org.website || '',
        address: org.address || '',
        phone: org.phone || '',
        description: org.description || '',
      })
    }
  }, [organization])

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const updateData: any = {
        name: data.name,
        industry: data.industry,
        timezone: data.timezone,
        currency: data.currency,
        website: data.website,
        address: data.address,
        phone: data.phone,
        description: data.description,
      }
      return settingsApi.updateOrganization(updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      setIsDirty(false)
      // Show success message
      const successMsg = document.createElement('div')
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2'
      successMsg.innerHTML = '<span>✓</span> <span>Profile updated successfully!</span>'
      document.body.appendChild(successMsg)
      setTimeout(() => {
        document.body.removeChild(successMsg)
      }, 3000)
    },
    onError: () => {
      const errorMsg = document.createElement('div')
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      errorMsg.textContent = 'Failed to update profile. Please try again.'
      document.body.appendChild(errorMsg)
      setTimeout(() => {
        document.body.removeChild(errorMsg)
      }, 3000)
    },
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!organization) {
    return <div className="text-gray-900 dark:text-white">Organization not found</div>
  }

  const organizationCreatedAt = (organization as any).createdAt
    ? format(new Date((organization as any).createdAt), 'MMMM d, yyyy')
    : 'N/A'

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center space-x-3">
          <User className="w-8 h-8 text-primary-600" />
          <span>Profile</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your organization and personal profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{user?.name || 'N/A'}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This is your account name</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{user?.email || 'N/A'}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your login email</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                  {user?.role || 'N/A'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your account role</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Member Since
              </label>
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{organizationCreatedAt}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Organization creation date</p>
            </div>
          </div>
        </div>

        {/* Organization Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organization Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
                placeholder="Enter company name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value as Industry)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value as Currency)}
                    className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr} {curr === 'USD' ? '($)' : curr === 'EUR' ? '(€)' : '(₹)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timezone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  rows={4}
                  placeholder="Brief description of your organization..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all hover:scale-105 font-medium"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

