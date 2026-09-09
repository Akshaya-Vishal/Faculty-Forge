import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Printer,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useData } from '../context/DataContext'
import { PaperPreviewModal } from '../components/common/PaperPreviewModal'
import { BloomBadge } from '../components/ui/Badge'
import type { QuestionPaper } from '../types/models'

export function HomePage() {
  const { papers } = useData()
  const navigate = useNavigate()

  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)

  const handleDemoFaculty = () => {
    navigate(ROUTES.LOGIN)
  }

  const handleDemoAdmin = () => {
    navigate(ROUTES.LOGIN)
  }

  const samplePaper = papers[0] || null

  return (
    <div className="min-h-svh bg-slate-900 text-white selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">Faculty Forge</span>
              <span className="ml-2 hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 sm:inline">
                Autonomous Exam Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={handleDemoFaculty}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Zap className="size-4" />
              Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 size-[350px] rounded-full bg-cyan-600/15 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md">
            <Sparkles className="size-3.5 text-indigo-400" />
            <span>AICTE & NBA Compliant Question Paper Management Platform</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Smarter Question Papers.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Precision Blueprinting.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            Empower faculty to design high-quality examination papers with automated Bloom's taxonomy
            balance validation, intelligent question banks, automated Set A/B generation, and seamless
            Examination Cell review workflows.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleDemoFaculty}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-600/40 hover:from-indigo-500 hover:to-indigo-400 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <User className="size-5" />
              Launch as Faculty Author
              <ArrowRight className="size-4" />
            </button>

            <button
              onClick={handleDemoAdmin}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-base font-bold text-slate-200 shadow-xl backdrop-blur-md hover:bg-slate-700 hover:text-white transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Shield className="size-5 text-indigo-400" />
              Launch as Exam Cell (CoE)
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-xs">
              <p className="text-3xl font-extrabold text-white">100%</p>
              <p className="mt-1 text-xs text-slate-400">Bloom's Taxonomy Compliant</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-xs">
              <p className="text-3xl font-extrabold text-cyan-400">&lt; 15 min</p>
              <p className="mt-1 text-xs text-slate-400">Question Paper Authoring</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-xs">
              <p className="text-3xl font-extrabold text-emerald-400">Auto A/B/C</p>
              <p className="mt-1 text-xs text-slate-400">Randomized Set Generator</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-xs">
              <p className="text-3xl font-extrabold text-indigo-400">1-Click</p>
              <p className="mt-1 text-xs text-slate-400">University Print & PDF Export</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Paper Preview Simulator Showcase */}
      <section className="relative border-y border-slate-800 bg-slate-950/70 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Built for Real University Regulations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Inspect how Faculty Forge generates formatted question papers with Course Outcomes (CO1-CO5),
              Bloom's taxonomy cognitive levels (L1-L6), and choice matrices ready for print.
            </p>
          </div>

          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400">
                  CS3301_MidTerm1_2026_SetA.qp
                </span>
              </div>
              <div className="flex items-center gap-2">
                {samplePaper && (
                  <button
                    onClick={() => setPreviewPaper(samplePaper)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    Open Live Print Layout
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                    CS3301 &bull; DATA STRUCTURES AND ALGORITHMS
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Mid-Term Examination I — Spring 2026
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    Max Marks: 50
                  </span>
                  <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-400">
                    Time: 90 Mins
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-slate-800 text-xs font-bold font-mono text-slate-300">
                      Q1
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      Define Abstract Data Type (ADT) and illustrate the LIFO principle with a diagram.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-400">2M</span>
                    <span className="text-xs font-mono text-indigo-300">CO1</span>
                    <BloomBadge level="L1" showLabel={false} />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-slate-800 text-xs font-bold font-mono text-slate-300">
                      Q6
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        (a) Convert the infix expression (A + B * C) / (D - E ^ F) into postfix using Stack.
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-bold text-indigo-400 uppercase">
                        --- [OR] Choice: Doubly Linked List Operations ---
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-400">15M</span>
                    <span className="text-xs font-mono text-indigo-300">CO1</span>
                    <BloomBadge level="L3" showLabel={false} />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-slate-800 text-xs font-bold font-mono text-slate-300">
                      Q10
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      Design an optimal LRU Cache system with O(1) get/put time complexity using Hash Map and Doubly Linked List.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-400">10M</span>
                    <span className="text-xs font-mono text-indigo-300">CO5</span>
                    <BloomBadge level="L6" showLabel={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="py-20 sm:py-28 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Complete Academic Examination Infrastructure
            </h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Everything required from syllabus mapping to examination hall question paper delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-800/40 p-8 hover:border-indigo-500/50 transition-all group">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <BarChart3 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Bloom's Taxonomy Engine</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Live cognitive distribution visualizer verifies that question papers balance lower-order
                memory (L1/L2) with higher-order application, analysis, and synthesis (L3-L6).
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-800/40 p-8 hover:border-cyan-500/50 transition-all group">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <Cpu className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI-Assisted Question Bank</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Organize questions by Course Unit, Course Outcome (CO1-CO5), and difficulty. Generate
                smart question alternatives aligned with syllabus topics in seconds.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-800/40 p-8 hover:border-emerald-500/50 transition-all group">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Layers className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Automated Set A/B/C Randomizer</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Exam Controllers can automatically generate multiple balanced, randomized question paper
                sets obeying exact blueprint marks and module coverage constraints.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-800/40 p-8 hover:border-purple-500/50 transition-all group">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Examination Cell Review Workbench</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Side-by-side inspection, inline section feedback annotations, digital approval stamps, and
                blind review modes to maintain complete confidentiality.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-800/40 p-8 hover:border-amber-500/50 transition-all group">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <FileCheck className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Syllabus & Course Outcome Tracking</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Track full coverage across all 5 syllabus units and compute Course Outcome (CO)
                attainment projections automatically for accreditation audits.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-800/40 p-8 hover:border-rose-500/50 transition-all group">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <FileText className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant University Print Layout</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Pixel-perfect university standard header, tables, marks boxes, choice notation, and
                footer approval signatures ready to print or export to PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Experience Showcase */}
      <section className="border-t border-slate-800 bg-slate-950 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                    <User className="size-6" />
                  </div>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                    Faculty Role
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">For Faculty & Course Coordinators</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Interactive Question Paper Builder with Section A, B & C</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>1-Click Question Bank insertion and AI suggestions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Live Total Marks and Bloom's balance validator</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Real-time submission status tracking and revision management</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleDemoFaculty}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Login as Dr. Sarah Jenkins (Faculty)
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-800/40 to-slate-900 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-800 text-indigo-400 border border-slate-700">
                    <Shield className="size-6" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                    Admin / CoE Role
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">For Examination Cell & HODs</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Interactive Paper Review Workbench with section feedback</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Automated Set A, Set B, and Set C randomized generator</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Departmental submission tracking and compliance audit</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Digital approval stamp and confidential exam pack export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleDemoAdmin}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-slate-100 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
              >
                Login as Prof. Robert Vance (CoE)
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">Faculty Forge</span>
            <span>&bull; Faculty Question Paper Management System</span>
          </div>
          <p>&copy; 2026 Faculty Forge. Built for Academic Institutions.</p>
        </div>
      </footer>

      {/* Live Print Layout Modal */}
      <PaperPreviewModal
        paper={previewPaper}
        isOpen={previewPaper !== null}
        onClose={() => setPreviewPaper(null)}
      />
    </div>
  )
}
