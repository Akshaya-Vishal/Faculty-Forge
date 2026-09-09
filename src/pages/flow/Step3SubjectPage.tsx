import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Plus,
  Search,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { DEPARTMENTS_CATALOG } from '../../data/mockData'
import { AppLayout } from '../../components/layout/AppLayout'
import { StepBreadcrumbs } from '../../components/layout/StepBreadcrumbs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'

export function Step3SubjectPage() {
  const { dept, sem } = useParams<{ dept: string; sem: string }>()
  const navigate = useNavigate()
  const { courses } = useData()
  const { showToast } = useToast()

  const semNumber = parseInt(sem || '3') || 3
  const selectedDept =
    DEPARTMENTS_CATALOG.find((d) => d.code === dept) || DEPARTMENTS_CATALOG[1]

  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [newCredits, setNewCredits] = useState(3)

  // Filter subjects by Department and Semester
  // If no exact match for this semester in mock, show matching semester courses or general ones
  const availableCourses = courses.filter((c) => {
    const matchDept = c.departmentCode === selectedDept.code || !c.departmentCode
    const matchSem = c.semester === semNumber
    return matchDept && matchSem
  })

  // Fallback courses if none exist for a particular semester in mock data
  const displayCourses =
    availableCourses.length > 0
      ? availableCourses
      : courses.filter((c) => c.semester === semNumber || c.departmentCode === selectedDept.code)

  const filtered = displayCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelectCourse = (courseId: string) => {
    navigate(`/create/${selectedDept.code}/${semNumber}/${courseId}`)
  }

  const handleAddCustomCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode.trim() || !newName.trim()) return

    showToast('success', 'Subject Added', `Added ${newCode} - ${newName}`)
    setIsAddModalOpen(false)
    // Select this subject immediately
    navigate(`/create/${selectedDept.code}/${semNumber}/crs-cse-s3-1`)
  }

  return (
    <AppLayout role="faculty" pageTitle="Step 3: Select Course / Subject">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Step Indicator */}
        <StepBreadcrumbs
          currentStep={3}
          deptCode={selectedDept.code}
          semNumber={semNumber}
        />

        {/* Hero Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
                Page 3 of 6 &bull; {selectedDept.code} &bull; Semester {semNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Select Your Subject / Course
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Here are the pre-configured subjects available for <b>Semester {semNumber} ({selectedDept.name})</b>.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="size-4" />
            + Add Custom Subject
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject by code or name (e.g. CS3301, Data Structures)..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
          />
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course.id)}
              className="group relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {course.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {course.credits} Credits &bull; {course.regulation || 'KCET 2021'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {course.name}
                </h3>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>{course.units ? course.units.length : 5} Syllabus Units</span>
                  <span>&bull;</span>
                  <span>{course.courseOutcomes ? course.courseOutcomes.length : 5} CO Outcomes</span>
                </div>

                {course.assignedFacultyName && (
                  <p className="mt-2 text-xs text-indigo-700 font-medium bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/60">
                    Coordinator: <b>{course.assignedFacultyName}</b>
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Select for Question Paper</span>
                <div className="flex size-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding custom course */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Custom Subject / Course"
          description={`Add a new subject to ${selectedDept.code} Semester ${semNumber} curriculum.`}
          maxWidth="md"
        >
          <form onSubmit={handleAddCustomCourse} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. CS3302"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Title</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Object Oriented Programming"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                value={newCredits}
                onChange={(e) => setNewCredits(parseInt(e.target.value) || 3)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="text-xs bg-indigo-600">
                Save & Select Subject
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
