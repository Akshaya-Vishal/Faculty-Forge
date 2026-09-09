import JSZip from 'jszip'
import type { QuestionPaper } from '../types/models'

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

type WordElement = Element & { ownerDocument: Document }

function wordElement(document: Document, name: string) {
  return document.createElementNS(WORD_NAMESPACE, `w:${name}`)
}

function setCellText(cell: WordElement, text: string) {
  const document = cell.ownerDocument
  const properties = Array.from(cell.children).find(
    (child) => child.namespaceURI === WORD_NAMESPACE && child.localName === 'tcPr',
  )
  while (cell.firstChild) cell.removeChild(cell.firstChild)
  if (properties) cell.appendChild(properties)

  const paragraph = wordElement(document, 'p')
  const run = wordElement(document, 'r')
  const textNode = wordElement(document, 't')
  textNode.setAttribute('xml:space', 'preserve')
  textNode.textContent = text
  run.appendChild(textNode)
  paragraph.appendChild(run)
  cell.appendChild(paragraph)
}

function setParagraphText(paragraph: WordElement, text: string) {
  const document = paragraph.ownerDocument
  const properties = Array.from(paragraph.children).find(
    (child) => child.namespaceURI === WORD_NAMESPACE && child.localName === 'pPr',
  )
  while (paragraph.firstChild) paragraph.removeChild(paragraph.firstChild)
  if (properties) paragraph.appendChild(properties)

  const run = wordElement(document, 'r')
  const textNode = wordElement(document, 't')
  textNode.setAttribute('xml:space', 'preserve')
  textNode.textContent = text
  run.appendChild(textNode)
  paragraph.appendChild(run)
}

function rowCells(row: Element) {
  return Array.from(row.getElementsByTagNameNS(WORD_NAMESPACE, 'tc')) as WordElement[]
}

function rowText(row: Element) {
  return normalized(row.textContent || '')
}

function fillHeaderRows(paper: QuestionPaper, rows: Element[]) {
  const assessmentRow = rows.find((row) => rowText(row).includes('internal assessment:'))
  const courseRow = rows.find((row) => rowText(row).includes('course code - course name'))
  const detailsRow = rows.find((row) => rowText(row).includes('regulation:'))

  if (assessmentRow) {
    const cells = rowCells(assessmentRow)
    if (cells[0]) setCellText(cells[0], `Internal Assessment: ${paper.internalType === 'Internal 2' ? 'II' : 'I'}`)
    if (cells[1]) setCellText(cells[1], `Semester: ${paper.semester || 'Third/Fifth/Seventh'}`)
  }

  if (courseRow) {
    const cells = rowCells(courseRow)
    if (cells[0]) {
      setCellText(
        cells[0],
        `${paper.courseCode} - ${paper.courseName}\n(Common to ${paper.commonTo || '____'})`,
      )
    }
  }

  if (detailsRow) {
    const cells = rowCells(detailsRow)
    if (cells[0]) setCellText(cells[0], `Regulation: ${paper.regulation || 'KCET 2021'}`)
    if (cells[1]) {
      setCellText(
        cells[1],
        `Max. Marks : ${paper.maxMarks} Marks\nDuration: ${paper.durationText || `${paper.durationMinutes} minutes`}`,
      )
    }
  }
}

function fillCourseOutcomes(paper: QuestionPaper, rows: Element[]) {
  const headerIndex = rows.findIndex((row) => rowText(row).includes('co index') && rowText(row).includes('course outcomes'))
  if (headerIndex < 0) return

  const outcomes = paper.courseOutcomesList.slice(0, 3)
  for (let index = 0; index < 3; index += 1) {
    const row = rows[headerIndex + index + 1]
    if (!row) continue
    const cells = rowCells(row)
    const outcome = outcomes[index]
    if (!outcome) {
      cells.forEach((cell) => setCellText(cell, ''))
      continue
    }
    if (cells[0]) setCellText(cells[0], outcome.code)
    if (cells[1]) setCellText(cells[1], outcome.description)
  }
}

function fillMarksDistribution(paper: QuestionPaper, rows: Element[]) {
  const headerIndex = rows.findIndex((row) => rowText(row).includes('marks distribution based on bloom'))
  const distributionRow = rows[headerIndex + 2]
  if (!distributionRow) return

  const marksByLevel: Record<string, number> = {
    K1: 0,
    K2: 0,
    K3: 0,
    K4: 0,
  }
  paper.sections.flatMap((section) => section.questions).forEach((question) => {
    const level = question.knowledgeLevel || question.bloomLevel || 'K1'
    const bucket = level === 'K1' || level === 'K2' || level === 'K3' ? level : 'K4'
    marksByLevel[bucket] += question.marks || 0
  })

  const total = Object.values(marksByLevel).reduce((sum, value) => sum + value, 0)
  rowCells(distributionRow).forEach((cell, index) => {
    const value = index === 0
      ? marksByLevel.K1
      : index === 1
        ? marksByLevel.K2
        : index === 2
          ? marksByLevel.K3
          : index === 3
            ? marksByLevel.K4
            : total || paper.maxMarks
    setCellText(cell, value ? String(value) : '-')
  })
}

function questionRows(document: Document) {
  return Array.from(document.getElementsByTagNameNS(WORD_NAMESPACE, 'tr'))
}

function normalized(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function fillQuestionRows(document: Document, paper: QuestionPaper) {
  const rows = questionRows(document)
  const usedRows = new Set<Element>()
  const partA = paper.sections.find((section) => section.sectionKey === 'PART_A')
  const questions = paper.sections.flatMap((section) => section.questions)

  const fillRow = (row: Element, question: { questionNumber?: string; courseOutcome: string; knowledgeLevel: string; text: string; marks: number }) => {
    const cells = Array.from(row.getElementsByTagNameNS(WORD_NAMESPACE, 'tc')) as WordElement[]
    if (cells.length === 0) return

    const coCell = cells[0]
    const markCell = cells[cells.length - 1]
    const textCellIndex = cells.length >= 4 ? 2 : 1
    const textCell = cells[textCellIndex] || cells[cells.length - 2] || cells[1] || cells[0]

    setCellText(coCell, `${question.courseOutcome}, ${question.knowledgeLevel || 'K1'}`)

    const questionNumber = question.questionNumber ? `${question.questionNumber}`.trim() : ''
    const questionText = question.text.trim()
    const formattedQuestionText = questionNumber && !questionText.toLowerCase().startsWith(questionNumber.toLowerCase())
      ? `${questionNumber} ${questionText}`
      : questionText

    if (textCell) setCellText(textCell, formattedQuestionText)
    if (markCell) setCellText(markCell, String(question.marks))
  }

  const partAHeaderIndex = rows.findIndex((row) => normalized(row.textContent || '').includes('part a (5 x 2 = 10 marks)'))
  if (partA && partAHeaderIndex >= 0) {
    partA.questions.forEach((question, index) => {
      const row = rows[partAHeaderIndex + index + 1]
      if (row) {
        usedRows.add(row)
        fillRow(row, { ...question, questionNumber: question.questionNumber || `${index + 1}.` })
      }
    })
  }

  const partBHeaderIndex = rows.findIndex((row) => normalized(row.textContent || '').includes('part b (1 x 8 = 8 marks)'))
  const partCHeaderIndex = rows.findIndex((row) => normalized(row.textContent || '').includes('part c (2 x 16 = 32 marks)'))

  questions.filter((question) => question.questionNumber !== '1.' && question.questionNumber !== '2.' && question.questionNumber !== '3.' && question.questionNumber !== '4.' && question.questionNumber !== '5.').forEach((question) => {
    const candidates = rows.filter((row) => {
      if (usedRows.has(row)) return false
      const rowIndex = rows.indexOf(row)
      const sectionStart = question.questionNumber.startsWith('6') ? partBHeaderIndex : partCHeaderIndex
      if (sectionStart < 0 || rowIndex <= sectionStart) return false
      const rowText = normalized(row.textContent || '')
      const number = normalized(question.questionNumber)
      return rowText.includes(number) && row.getElementsByTagNameNS(WORD_NAMESPACE, 'tc').length >= 3
    })

    const row = candidates[0]
    if (!row) return
    usedRows.add(row)

    fillRow(row, question)

    if (question.orQuestion) {
      const orNumber = normalized(question.orQuestion.subLabel || question.questionNumber.replace('(a)', '(b)'))
      const orRow = rows.find((candidate) => {
        if (usedRows.has(candidate)) return false
        const rowIndex = rows.indexOf(candidate)
        const sectionStart = question.questionNumber.startsWith('6') ? partBHeaderIndex : partCHeaderIndex
        if (sectionStart < 0 || rowIndex <= sectionStart) return false
        const rowText = normalized(candidate.textContent || '')
        return rowText.includes(orNumber) && candidate.getElementsByTagNameNS(WORD_NAMESPACE, 'tc').length >= 3
      })
      if (orRow) {
        usedRows.add(orRow)
        fillRow(orRow, { ...question.orQuestion, questionNumber: question.orQuestion.subLabel })
      }
    }
  })
}

export async function createFilledQuestionPaperDocx(paper: QuestionPaper) {
  const response = await fetch('/templates/question-paper-template.docx')
  if (!response.ok) throw new Error('Unable to load the official Word template.')

  const zip = await JSZip.loadAsync(await response.arrayBuffer())
  const documentXml = await zip.file('word/document.xml')?.async('string')
  if (!documentXml) throw new Error('The Word template is missing its document content.')

  const parser = new DOMParser()
  const document = parser.parseFromString(documentXml, 'application/xml')
  const rows = questionRows(document)
  const departmentParagraph = Array.from(document.getElementsByTagNameNS(WORD_NAMESPACE, 'p')).find(
    (paragraph) => normalized(paragraph.textContent || '').startsWith('department of'),
  )
  if (departmentParagraph) {
    setParagraphText(
      departmentParagraph as WordElement,
      `DEPARTMENT OF ${paper.departmentName || paper.branch || '________________'}`,
    )
  }
  fillHeaderRows(paper, rows)
  fillCourseOutcomes(paper, rows)
  fillMarksDistribution(paper, rows)
  fillQuestionRows(document, paper)

  const serialized = new XMLSerializer().serializeToString(document)
  zip.file('word/document.xml', serialized)
  return zip.generateAsync({ type: 'blob' })
}

export async function downloadFilledQuestionPaper(paper: QuestionPaper) {
  const blob = await createFilledQuestionPaperDocx(paper)
  const wordBlob = new Blob([blob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const url = URL.createObjectURL(wordBlob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = `${paper.courseCode}-${paper.internalType || 'Question-Paper'}.docx`
  anchor.style.display = 'none'
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

