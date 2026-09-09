import { Download } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'

export function AdminReportsPage() {
  const { departments } = useData()
  const { showToast } = useToast()

  const handleExportSummary = () => {
    showToast(
      'success',
      'Compliance Report Exported',
      'Autonomous Examination Compliance Summary downloaded as CSV/Excel.',
    )
  }

  return (
    <AppLayout role="admin" pageTitle="Compliance Reports & Audit">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Institutional Compliance & Bloom's Audit Report
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive NBA/AICTE accreditation metrics and question paper quality breakdown.
            </p>
          </div>

          <Button variant="primary" onClick={handleExportSummary} className="gap-2 bg-indigo-600 shadow-md text-xs">
            <Download className="size-4" />
            Export Compliance Audit Sheet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Institutional Attainment
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600">88.4%</span>
              <span className="text-xs font-semibold text-emerald-600">Compliant</span>
            </div>
            <p className="text-xs text-slate-500">Based on 48 academic courses evaluation</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bloom's Cognitive Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-600">68% HOT</span>
              <span className="text-xs font-semibold text-slate-500">32% LOT</span>
            </div>
            <p className="text-xs text-slate-500">Balanced Higher vs Lower Order Thinking</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Syllabus Unit Coverage Integrity
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">100%</span>
              <span className="text-xs font-semibold text-emerald-600">Verified</span>
            </div>
            <p className="text-xs text-slate-500">Zero unit omission across approved sets</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Departmental Submission & Certification Matrix
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Academic Department</th>
                  <th className="p-3">Total Courses</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Approved & Certified</th>
                  <th className="p-3">Pending Review</th>
                  <th className="p-3">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => {
                  const rate = Math.round((d.approvedPapers / d.totalCourses) * 100)
                  return (
                    <tr key={d.department} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{d.department}</td>
                      <td className="p-3 font-semibold text-slate-700">{d.totalCourses}</td>
                      <td className="p-3 text-slate-700">{d.submittedPapers}</td>
                      <td className="p-3 font-bold text-emerald-700">{d.approvedPapers}</td>
                      <td className="p-3 font-bold text-amber-700">{d.pendingPapers}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            rate >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
