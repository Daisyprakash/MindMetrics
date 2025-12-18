import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Download, Loader2 } from 'lucide-react'
import { reportApi } from '@/api/api'
import type { Report, ReportType } from '@/types'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export default function Reports() {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<ReportType>('monthly')

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportApi.getReports(),
  })

  const generateMutation = useMutation({
    mutationFn: (type: ReportType) => {
      const now = new Date()
      let periodStart: Date
      let periodEnd: Date

      if (type === 'monthly') {
        periodStart = startOfMonth(subMonths(now, 1))
        periodEnd = endOfMonth(subMonths(now, 1))
      } else if (type === 'quarterly') {
        const quarter = Math.floor(now.getMonth() / 3)
        periodStart = new Date(now.getFullYear(), quarter * 3, 1)
        periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
      } else {
        // Custom - last 30 days
        periodStart = subMonths(now, 1)
        periodEnd = now
      }

      return reportApi.generateReport({
        type,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const handleGenerate = () => {
    generateMutation.mutate(selectedType)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and download analytics reports</p>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate New Report</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ReportType)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="custom">Custom</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
        {generateMutation.isError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Failed to generate report. Please try again.
          </p>
        )}
        {generateMutation.isSuccess && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            Report generated successfully!
          </p>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Reports</h2>
        </div>
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report: any) => (
              <ReportRow key={report._id || report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No reports generated yet. Create your first report above.
          </div>
        )}
      </div>
    </div>
  )
}

function ReportRow({ report }: { report: any }) {
  const reportId = report._id || report.id
  const reportType = report.type
  const generatedAt = report.createdAt || report.generatedAt
  const summary = report.summary || {}
  const metrics = Object.keys(summary).filter((k) => summary[k] !== undefined)

  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-4">
        <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white capitalize">{reportType} Report</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generated: {generatedAt ? format(new Date(generatedAt), 'MMM d, yyyy HH:mm') : 'N/A'}
          </p>
          {metrics.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Metrics: {metrics.join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span
          className={`px-3 py-1 text-xs font-medium rounded ${
            report.status === 'ready'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
          }`}
        >
          {report.status}
        </span>
        <button
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 disabled:opacity-50"
          onClick={() => reportApi.downloadReport(reportId, 'csv')}
          disabled={report.status !== 'completed'}
        >
          <Download className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  )
}
