import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Loader2, Sparkles, Settings as SettingsIcon, Building2, Globe, DollarSign } from 'lucide-react'
import { settingsApi } from '@/api/api'
import type { Account, Industry, Currency, AccountPlan } from '@/types'

const companyNames = [
  'Acme Corporation', 'Tech Solutions Inc', 'Digital Innovations', 
  'Cloud Services Co', 'Data Analytics Pro', 'Enterprise Systems'
]
const industries: Industry[] = ['SaaS', 'Ecommerce', 'Fintech']
const currencies: Currency[] = ['USD', 'EUR', 'INR']
const plans: AccountPlan[] = ['Starter', 'Pro', 'Enterprise']
const timezones = [
  'America/New_York', 'America/Los_Angeles', 'Europe/London', 
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
]

const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export default function Settings() {
  const queryClient = useQueryClient()
  const [isDirty, setIsDirty] = useState(false)

  const { data: account, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => settingsApi.getOrganization(),
  })

  const [formData, setFormData] = useState<Partial<Account>>({})

  useEffect(() => {
    if (account) {
      // Transform backend data to frontend format
      setFormData({
        id: (account as any)._id || account.id,
        name: account.name,
        industry: account.industry as Industry,
        timezone: account.timezone,
        currency: account.currency as Currency,
        plan: 'Pro' as AccountPlan, // Backend doesn't have plan, use default
        createdAt: (account as any).createdAt || new Date().toISOString(),
      })
    }
  }, [account])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Account>) => {
      const updateData: any = {
        name: data.name,
        industry: data.industry,
        timezone: data.timezone,
        currency: data.currency,
      }
      return settingsApi.updateOrganization(updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      setIsDirty(false)
      alert('Settings saved successfully!')
    },
    onError: () => {
      alert('Failed to save settings. Please try again.')
    },
  })

  const handleChange = (field: keyof Account, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleGenerateRandom = () => {
    setFormData({
      name: randomChoice(companyNames),
      industry: randomChoice(industries),
      timezone: randomChoice(timezones),
      currency: randomChoice(currencies),
      plan: randomChoice(plans),
    })
    setIsDirty(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(currentData)
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

  if (!account) {
    return <div className="text-gray-900 dark:text-white">Organization not found</div>
  }

  const currentData = {
    name: formData.name ?? account.name,
    industry: (formData.industry ?? account.industry) as Industry,
    timezone: formData.timezone ?? account.timezone,
    currency: (formData.currency ?? account.currency) as Currency,
    plan: formData.plan ?? ('Pro' as AccountPlan),
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-primary-600" />
          <span>Settings</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generate Random Button */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl shadow-lg border border-primary-200 dark:border-primary-800 p-4 transition-all hover:shadow-xl">
          <button
            type="button"
            onClick={handleGenerateRandom}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 border-2 border-primary-300 dark:border-primary-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Random Account Data</span>
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organization Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={currentData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry
              </label>
              <select
                value={currentData.industry}
                onChange={(e) => handleChange('industry', e.target.value as Industry)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                <option value="SaaS">SaaS</option>
                <option value="Ecommerce">Ecommerce</option>
                <option value="Fintech">Fintech</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timezone
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={currentData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="America/New_York"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                value={currentData.currency}
                onChange={(e) => handleChange('currency', e.target.value as Currency)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plan
              </label>
              <select
                value={currentData.plan}
                onChange={(e) => handleChange('plan', e.target.value as AccountPlan)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
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

