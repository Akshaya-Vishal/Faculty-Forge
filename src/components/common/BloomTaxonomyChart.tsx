import { KNOWLEDGE_LEVEL_MAP } from '../../types/models'
import type { KnowledgeLevel, QuestionPaper } from '../../types/models'

interface BloomTaxonomyChartProps {
  paper: QuestionPaper
  showGuidelineNotice?: boolean
}

export function BloomTaxonomyChart({ paper, showGuidelineNotice = true }: BloomTaxonomyChartProps) {
  // Aggregate marks per knowledge level
  const marksPerLevel: Record<KnowledgeLevel, number> = {
    K1: 0,
    K2: 0,
    K3: 0,
    K4: 0,
    K5: 0,
    K6: 0,
  }

  let totalCountedMarks = 0

  paper.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      const k = (q.knowledgeLevel || q.bloomLevel || 'K1') as KnowledgeLevel
      marksPerLevel[k] = (marksPerLevel[k] || 0) + (q.marks || 0)
      totalCountedMarks += q.marks || 0
    })
  })

  const lowerOrderMarks = marksPerLevel.K1 + marksPerLevel.K2
  const higherOrderMarks = marksPerLevel.K3 + marksPerLevel.K4 + marksPerLevel.K5 + marksPerLevel.K6

  const lowerOrderPct = totalCountedMarks > 0 ? Math.round((lowerOrderMarks / totalCountedMarks) * 100) : 0
  const higherOrderPct = totalCountedMarks > 0 ? Math.round((higherOrderMarks / totalCountedMarks) * 100) : 0

  const levels: KnowledgeLevel[] = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6']

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">
            Bloom's / Knowledge Level Distribution
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Cognitive taxonomy allocation (K1-K6)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700 border border-blue-100">
            K1-K2 (LOT): {lowerOrderPct}%
          </span>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 border border-emerald-100">
            K3-K6 (HOT): {higherOrderPct}%
          </span>
        </div>
      </div>

      {/* Progress Bar distribution */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex shadow-inner">
        {levels.map((lvl) => {
          const marks = marksPerLevel[lvl]
          const pct = totalCountedMarks > 0 ? (marks / totalCountedMarks) * 100 : 0
          if (pct === 0) return null

          const colorMap: Record<KnowledgeLevel, string> = {
            K1: 'bg-blue-500',
            K2: 'bg-cyan-500',
            K3: 'bg-emerald-500',
            K4: 'bg-amber-500',
            K5: 'bg-purple-500',
            K6: 'bg-rose-500',
          }

          return (
            <div
              key={lvl}
              style={{ width: `${pct}%` }}
              className={`${colorMap[lvl]} transition-all duration-500`}
              title={`${KNOWLEDGE_LEVEL_MAP[lvl].kLabel} (${KNOWLEDGE_LEVEL_MAP[lvl].label}): ${marks} marks (${Math.round(pct)}%)`}
            />
          )
        })}
      </div>

      {/* Grid of all 6 levels */}
      <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {levels.map((lvl) => {
          const info = KNOWLEDGE_LEVEL_MAP[lvl]
          const marks = marksPerLevel[lvl]
          const pct = totalCountedMarks > 0 ? Math.round((marks / totalCountedMarks) * 100) : 0

          return (
            <div
              key={lvl}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ backgroundColor: info.color }} />
                <span className="text-xs font-bold text-slate-900 font-mono">{info.kLabel}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 truncate max-w-full">
                {info.label}
              </span>
              <span className="text-xs font-extrabold text-slate-900 mt-0.5">
                {marks}M <span className="text-[10px] text-slate-500 font-normal">({pct}%)</span>
              </span>
            </div>
          )
        })}
      </div>

      {showGuidelineNotice && (
        <div className="mt-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 p-2.5 text-[11px] text-indigo-900">
          <span className="font-bold">Autonomous Guideline: </span>
          <span>
            Aim for ~20-30% K1-K2 (Remember/Understand) and ~70-80% K3-K5 (Apply/Analyze/Evaluate) for balanced internal assessments.
          </span>
        </div>
      )}
    </div>
  )
}
