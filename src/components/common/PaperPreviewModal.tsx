import { Download, Printer, ShieldCheck } from 'lucide-react'
import type { QuestionPaper, KnowledgeLevel } from '../../types/models'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { downloadFilledQuestionPaper } from '../../lib/docxTemplate'

interface PaperPreviewModalProps {
  paper: QuestionPaper | null
  isOpen: boolean
  onClose: () => void
}

export function PaperPreviewModal({ paper: paperProp, isOpen, onClose }: PaperPreviewModalProps) {
  if (!paperProp) return null
  const paper = paperProp

  const handleDownloadTemplate = async () => {
    try {
      await downloadFilledQuestionPaper(paper)
    } catch (error) {
      console.error('Unable to download filled Word template', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Preview</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{paper.courseCode} - {paper.courseName}</h3>
          <p className="mt-2 text-sm text-slate-500">
            Review the official template layout first. Download creates the filled Word document with your questions.
          </p>
        </div>
        <iframe
          title="Official question paper template preview"
          src="/templates/question-paper-template.pdf"
          className="h-[65vh] min-h-[420px] w-full rounded-lg border border-slate-200 bg-slate-100"
        />
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleDownloadTemplate}>
            <Download className="size-4" />
            Download Filled Word
          </Button>
        </div>
      </div>
    </Modal>
  )

  const handlePrint = () => {
    window.print()
  }

  // Calculate marks per Knowledge/Bloom level for the distribution table
  const kMarks: Record<KnowledgeLevel, number> = {
    K1: 0,
    K2: 0,
    K3: 0,
    K4: 0,
    K5: 0,
    K6: 0,
  }

  paper.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      const k = (q.knowledgeLevel || q.bloomLevel || 'K1') as KnowledgeLevel
      kMarks[k] = (kMarks[k] || 0) + (q.marks || 0)
    })
  })

  const totalCalculated =
    kMarks.K1 + kMarks.K2 + kMarks.K3 + kMarks.K4 + kMarks.K5 + kMarks.K6

  const partA = paper.sections.find((s) => s.sectionKey === 'PART_A') || paper.sections[0]
  const partB = paper.sections.find((s) => s.sectionKey === 'PART_B') || paper.sections[1]
  const partC = paper.sections.find((s) => s.sectionKey === 'PART_C') || paper.sections[2]

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      {/* Top Action Bar */}
      <div className="no-print -mt-2 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Official University Question Paper Sheet
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              KCET Autonomous Format &bull; {paper.courseCode} ({paper.internalType || 'Internal Assessment'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2 text-xs font-bold">
            <Printer className="size-4" />
            Print / Save as PDF
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2 text-xs bg-indigo-600 font-bold shadow-md">
            <Download className="size-4" />
            Download Question Paper
          </Button>
        </div>
      </div>

      {/* Official Sheet (Matches Kamaraj College PDF Template) */}
      <div
        className="print-page bg-white text-black font-serif border-2 border-black p-6 sm:p-10 shadow-sm max-w-4xl mx-auto text-xs leading-normal"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* Top College Header with Logo & Text */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="bg-[#0e2a5c] text-white px-5 py-1.5 rounded-sm font-sans font-black tracking-widest text-lg uppercase inline-block border-2 border-[#d4af37]">
              KAMARAJ
            </div>
          </div>
          <div className="font-sans font-bold text-[13px] tracking-wide uppercase text-[#0e2a5c]">
            COLLEGE OF ENGINEERING & TECHNOLOGY
          </div>
          <div className="font-sans text-[10px] uppercase tracking-wider font-semibold text-slate-700">
            (An Autonomous Institution - AFFILIATED TO ANNA UNIVERSITY, CHENNAI)
          </div>
          <div className="font-sans text-[9px] text-slate-600">
            S.P.G.Chidambara Nadar - C.Nagammal Campus
          </div>
          <div className="font-sans text-[9px] text-slate-600">
            S.P.G.C. Nagar, K.Vellakulam - 625 701 (Near VIRUDHUNAGAR).
          </div>

          <div className="font-sans font-bold text-xs uppercase mt-2 tracking-wide">
            B.E. / B.TECH. DEGREE EXAMINATIONS
          </div>
          <div className="font-sans text-[11px] font-semibold">
            (JUNE to OCTOBER 2026)
          </div>
          <div className="font-sans font-bold text-xs uppercase mt-0.5 tracking-wider">
            DEPARTMENT OF {paper.departmentName ? paper.departmentName.toUpperCase() : (paper.branch ? paper.branch.toUpperCase() : 'COMPUTER SCIENCE & ENGINEERING')}
          </div>
        </div>

        {/* Roll No and Reg No Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 text-[11px] font-sans font-semibold">
          <div>
            <span>Roll No. ________________________________</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Reg. No.</span>
            <div className="flex border border-black">
              {['9', '2', '0', '4', '', '', '', '', '', '', '', ''].map((d, i) => (
                <div
                  key={i}
                  className="w-5 h-5 border-r last:border-r-0 border-black flex items-center justify-center font-bold font-mono text-xs bg-white"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paper Metadata Table */}
        <table className="w-full border-collapse border border-black text-[11px] font-sans mb-3">
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 font-bold w-1/2">
                Internal Assessment: {paper.internalType === 'Internal 2' ? 'II' : 'I'}
              </td>
              <td className="p-1.5 font-bold">
                Semester: {paper.semester || 'Third Semester'}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td colSpan={2} className="p-1.5 text-center font-bold">
                Course Code - Course Name: <span className="font-mono text-xs">{paper.courseCode}</span> - {paper.courseName}
                {paper.commonTo && (
                  <span className="block text-[10px] font-normal italic">
                    (Common to {paper.commonTo})
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="border-r border-black p-1.5 font-bold">
                Regulation: {paper.regulation || 'KCET 2021'}
              </td>
              <td className="p-1.5 font-bold">
                <div className="flex items-center justify-between">
                  <span>Max. Marks : {paper.maxMarks} Marks</span>
                  <span>Duration : {paper.durationText || `${paper.durationMinutes} minutes`}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* CO Index Table */}
        {paper.courseOutcomesList && paper.courseOutcomesList.length > 0 && (
          <table className="w-full border-collapse border border-black text-[10.5px] font-sans mb-3">
            <thead>
              <tr className="border-b border-black bg-slate-100 font-bold">
                <th className="border-r border-black p-1 w-20 text-center">CO Index</th>
                <th className="p-1 text-center">Course Outcomes</th>
              </tr>
            </thead>
            <tbody>
              {paper.courseOutcomesList.map((co) => (
                <tr key={co.code} className="border-b last:border-b-0 border-black">
                  <td className="border-r border-black p-1 font-bold text-center font-mono">
                    {co.code}
                  </td>
                  <td className="p-1 pl-2">{co.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Marks distribution based on Bloom's Taxonomy Level */}
        <div className="mb-3">
          <div className="font-sans font-bold text-[11px] text-center bg-slate-100 border-t border-x border-black py-1 uppercase">
            Marks distribution based on Bloom's Taxonomy Level
          </div>
          <table className="w-full border-collapse border border-black text-[10.5px] font-sans text-center">
            <thead>
              <tr className="border-b border-black bg-slate-50 font-bold">
                <th className="border-r border-black p-1">Remember (K-1)</th>
                <th className="border-r border-black p-1">Understand (K-2)</th>
                <th className="border-r border-black p-1">Apply (K-3)</th>
                <th className="border-r border-black p-1">Analyze (K-4)</th>
                <th className="p-1">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-black p-1 font-bold font-mono">{kMarks.K1}</td>
                <td className="border-r border-black p-1 font-bold font-mono">{kMarks.K2}</td>
                <td className="border-r border-black p-1 font-bold font-mono">{kMarks.K3}</td>
                <td className="border-r border-black p-1 font-bold font-mono">{kMarks.K4 + kMarks.K5 + kMarks.K6}</td>
                <td className="p-1 font-bold font-mono text-black">{totalCalculated || paper.maxMarks}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Answer all questions title */}
        <div className="font-sans font-bold text-center text-[12px] uppercase tracking-wider my-2 border-y border-black py-0.5">
          Answer all the Questions
        </div>

        {/* PART A (5 x 2 = 10 Marks) */}
        {partA && (
          <div className="mb-4">
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-sans font-bold border-b border-black">
                  <th className="border-r border-black p-1 w-20 text-center">CO, BTL</th>
                  <th className="border-r border-black p-1 w-14 text-center">Q. No.</th>
                  <th className="border-r border-black p-1 text-center">
                    {partA.title || 'Part A (5 x 2 = 10 Marks)'}
                  </th>
                  <th className="p-1 w-16 text-center">Marks</th>
                </tr>
              </thead>
              <tbody>
                {partA.questions.map((q) => {
                  const btl = (q.knowledgeLevel || q.bloomLevel || 'K1').replace('K', 'K')
                  return (
                    <tr key={q.id} className="border-b last:border-b-0 border-black align-top">
                      <td className="border-r border-black p-1.5 text-center font-sans font-bold text-[10px]">
                        {q.courseOutcome}, {btl}
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-sans font-bold font-mono">
                        {q.questionNumber}
                      </td>
                      <td className="border-r border-black p-1.5">
                        <div className="whitespace-pre-line text-slate-900 leading-relaxed font-serif text-[12px]">
                          {q.text}
                        </div>
                      </td>
                      <td className="p-1.5 text-center font-sans font-bold font-mono">
                        {q.marks}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PART B (1 x 8 = 8 Marks) */}
        {partB && (
          <div className="mb-4">
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-sans font-bold border-b border-black">
                  <th className="border-r border-black p-1 w-20 text-center">CO, BTL</th>
                  <th className="border-r border-black p-1 w-14 text-center">Q. No.</th>
                  <th className="border-r border-black p-1 text-center">
                    {partB.title || 'Part B (1 x 8 = 8 Marks)'}
                  </th>
                  <th className="p-1 w-16 text-center">Marks</th>
                </tr>
              </thead>
              <tbody>
                {partB.questions.map((q) => {
                  const btl = (q.knowledgeLevel || q.bloomLevel || 'K2').replace('K', 'K')
                  return (
                    <tr key={q.id} className="border-b last:border-b-0 border-black align-top">
                      <td className="border-r border-black p-1.5 text-center font-sans font-bold text-[10px]">
                        {q.courseOutcome}, {btl}
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-sans font-bold font-mono">
                        {q.questionNumber || '6 (a)'}
                      </td>
                      <td className="border-r border-black p-1.5">
                        <div className="whitespace-pre-line text-slate-900 leading-relaxed font-serif text-[12px]">
                          {q.text}
                        </div>
                        {q.isChoice && q.orQuestion && (
                          <div className="mt-3 pt-2 border-t border-dashed border-black">
                            <div className="text-center font-sans font-bold text-xs uppercase tracking-widest my-1">
                              (OR)
                            </div>
                            <div className="whitespace-pre-line text-slate-900 leading-relaxed font-serif text-[12px]">
                              {q.orQuestion.text}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-1.5 text-center font-sans font-bold font-mono">
                        {q.marks}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PART C (2 x 16 = 32 Marks) */}
        {partC && (
          <div className="mb-4">
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-sans font-bold border-b border-black">
                  <th className="border-r border-black p-1 w-20 text-center">CO, BTL</th>
                  <th className="border-r border-black p-1 w-14 text-center">Q. No.</th>
                  <th className="border-r border-black p-1 text-center">
                    {partC.title || 'Part C (2 x 16 = 32 Marks)'}
                  </th>
                  <th className="p-1 w-16 text-center">Marks</th>
                </tr>
              </thead>
              <tbody>
                {partC.questions.map((q) => {
                  const btl = (q.knowledgeLevel || q.bloomLevel || 'K3').replace('K', 'K')
                  return (
                    <tr key={q.id} className="border-b last:border-b-0 border-black align-top">
                      <td className="border-r border-black p-1.5 text-center font-sans font-bold text-[10px]">
                        {q.courseOutcome}, {btl}
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-sans font-bold font-mono">
                        {q.questionNumber || '7 (a)'}
                      </td>
                      <td className="border-r border-black p-1.5">
                        <div className="whitespace-pre-line text-slate-900 leading-relaxed font-serif text-[12px]">
                          {q.text}
                        </div>
                        {q.isChoice && q.orQuestion && (
                          <div className="mt-3 pt-2 border-t border-dashed border-black">
                            <div className="text-center font-sans font-bold text-xs uppercase tracking-widest my-1">
                              (OR)
                            </div>
                            <div className="whitespace-pre-line text-slate-900 leading-relaxed font-serif text-[12px]">
                              {q.orQuestion.text}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-1.5 text-center font-sans font-bold font-mono">
                        {q.marks}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer & Approvals */}
        <div className="mt-8 pt-4 border-t border-black flex justify-between items-end text-[10.5px] font-sans">
          <div className="text-center">
            <div className="w-32 border-b border-black mb-1 mx-auto"></div>
            <p className="font-bold">Course Faculty</p>
            <p className="text-[10px] text-slate-600">{paper.facultyName}</p>
          </div>

          <div className="text-center">
            <div className="w-32 border-b border-black mb-1 mx-auto"></div>
            <p className="font-bold">HOD / Department Chair</p>
            <p className="text-[10px] text-slate-600">Dept. of {paper.departmentCode || 'CSE'}</p>
          </div>

          <div className="text-center">
            <div className="w-32 border-b border-black mb-1 mx-auto"></div>
            <p className="font-bold">Controller of Examinations</p>
            <p className="text-[10px] text-slate-600">KCET (Autonomous)</p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
