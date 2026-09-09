import { useState } from 'react'
import { CheckCircle, Clock, Layers, Sparkles } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { BloomBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'

export function SyllabusPage() {
  const { courses } = useData()
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '')

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0]

  return (
    <AppLayout role="faculty" pageTitle="Assigned Course Syllabus">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Course Syllabus & Curriculum Mapping</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Review syllabus units, topics breakdown, and Course Outcome (CO-PO) cognitive level targets.
            </p>
          </div>

          <Button to={ROUTES.FACULTY_PAPER_NEW} className="gap-2 bg-indigo-600">
            <Sparkles className="size-4" />
            Author Paper for Course
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCourseId === c.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono">{c.code}</span>
              <span>-</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {selectedCourse && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                    {selectedCourse.code}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {selectedCourse.regulation}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedCourse.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dept of {selectedCourse.department} &bull; Semester {selectedCourse.semester} &bull; {selectedCourse.credits} Credits
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Assigned Coordinator</span>
                  <span className="text-sm font-bold text-slate-900">{selectedCourse.assignedFacultyName}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="size-4 text-emerald-600" />
                Course Outcomes (CO) & Target Cognitive Levels
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCourse.courseOutcomes.map((co) => (
                  <div
                    key={co.code}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5"
                  >
                    <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-1 rounded shrink-0">
                      {co.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {co.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Target Level:</span>
                        <BloomBadge level={co.bloomTarget} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="size-4 text-indigo-600" />
                Syllabus Units Breakdown (5 Modules)
              </h4>
              <div className="space-y-4">
                {selectedCourse.units.map((unit) => (
                  <div
                    key={unit.unitNumber}
                    className="rounded-xl border border-slate-200 p-4 bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs">
                          {unit.unitNumber}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">
                          Unit {unit.unitNumber}: {unit.title}
                        </h5>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                        <Clock className="size-3.5 text-slate-400" />
                        {unit.hoursAllocated} Hours
                      </span>
                    </div>

                    <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                      {unit.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-slate-100/80 border border-slate-200/70 px-2.5 py-1 text-xs text-slate-700 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
