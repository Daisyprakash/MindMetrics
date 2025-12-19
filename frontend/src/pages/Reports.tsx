import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Download, Loader2 } from 'lucide-react'
import { reportApi } from '@/api/api'
import type { ReportType } from '@/types'
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center space-x-3">
          <FileText className="w-8 h-8 text-primary-600" />
          <span>Reports</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and download analytics reports</p>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate New Report</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ReportType)}
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="custom">Custom</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all hover:scale-105 font-medium"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
        {generateMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Failed to generate report. Please try again.
            </p>
          </div>
        )}
        {generateMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Report generated successfully!
            </p>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <span>Generated Reports</span>
          </h2>
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
    <div className="px-6 py-5 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent dark:hover:from-primary-900/10 flex items-center justify-between transition-all border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${
          report.status === 'completed'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
        }`}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white capitalize">{reportType} Report</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generated: {generatedAt ? format(new Date(generatedAt), 'MMM d, yyyy HH:mm') : 'N/A'}
          </p>
          {metrics.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Metrics: {metrics.join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
            report.status === 'completed'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
          }`}
        >
          {report.status === 'completed' ? 'Ready' : 'Pending'}
        </span>
        <button
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md shadow-primary-500/30"
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
