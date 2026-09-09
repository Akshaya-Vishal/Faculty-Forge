import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

export function AdminExamsPage() {
  const { examCycles, courses, addExamCycle } = useData()
  const { showToast } = useToast()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [semester, setSemester] = useState('Spring Semester')
  const [startDate, setStartDate] = useState('2026-04-10')
  const [endDate, setEndDate] = useState('2026-04-25')
  const [submissionDeadline, setSubmissionDeadline] = useState('2026-03-25')

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addExamCycle({
      name,
      academicYear,
      semester,
      startDate,
      endDate,
      submissionDeadline,
      status: 'Upcoming',
      totalPapersRequired: 48,
      totalPapersSubmitted: 0,
      totalPapersApproved: 0,
    })

    showToast('success', 'Exam Cycle Created', `Created examination cycle ${name}.`)
    setIsAddModalOpen(false)
    setName('')
  }

  return (
    <AppLayout role="admin" pageTitle="Exam Cycles & Course Allocations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Exam Cycles & Course Allocations
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure examination timelines, paper submission deadlines, and faculty course assignments.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-indigo-600 shadow-md text-xs"
          >
            <Plus className="size-4" />
            Create New Exam Cycle
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Examination Timelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examCycles.map((cycle) => (
              <div
                key={cycle.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      cycle.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {cycle.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{cycle.academicYear}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{cycle.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{cycle.semester}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Exam Dates:</span>
                    <span className="font-bold text-slate-800">
                      {cycle.startDate} to {cycle.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Faculty Deadline:</span>
                    <span className="font-bold text-rose-600">{cycle.submissionDeadline}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Papers Required: {cycle.totalPapersRequired}</span>
                  <span className="font-bold text-indigo-600">
                    {cycle.totalPapersApproved} Certified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Faculty Course Allocations</h3>
            <span className="text-xs text-slate-500 font-semibold">{courses.length} Allocated Courses</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Sem & Credits</th>
                  <th className="p-3">Assigned Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-indigo-700">{c.code}</td>
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 text-slate-600">{c.department}</td>
                    <td className="p-3 text-slate-600">Sem {c.semester} &bull; {c.credits} Cr</td>
                    <td className="p-3 font-medium text-slate-800">{c.assignedFacultyName || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Examination Cycle"
        description="Define exam period and paper submission cutoff deadlines for faculty."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Exam Cycle Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mid-Term Examination II - Spring 2026"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty Deadline</label>
              <input
                type="date"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-xs bg-indigo-600">
              Save Exam Cycle
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
