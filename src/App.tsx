import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'

// 6-Step Flow Pages
import { Step1DepartmentPage } from './pages/flow/Step1DepartmentPage'
import { Step2YearSemPage } from './pages/flow/Step2YearSemPage'
import { Step3SubjectPage } from './pages/flow/Step3SubjectPage'
import { Step4ExamTypePage } from './pages/flow/Step4ExamTypePage'
import { Step5InteractiveBuilderPage } from './pages/flow/Step5InteractiveBuilderPage'
import { Step6PaperHubPage } from './pages/flow/Step6PaperHubPage'

// Faculty Pages
import { QuestionBankPage } from './pages/faculty/QuestionBankPage'
import { SyllabusPage } from './pages/faculty/SyllabusPage'
import { FacultyProfilePage } from './pages/faculty/FacultyProfilePage'

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'
import { AdminPaperGeneratorPage } from './pages/admin/AdminPaperGeneratorPage'
import { AdminExamsPage } from './pages/admin/AdminExamsPage'
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage'
import { AdminFacultyPage } from './pages/admin/AdminFacultyPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { AdminProfilePage } from './pages/admin/AdminProfilePage'

export function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <Routes>
              {/* Home & Step 1 */}
              <Route path={ROUTES.HOME} element={<Step1DepartmentPage />} />
              <Route path={ROUTES.STEP1_DEPT} element={<Step1DepartmentPage />} />
              <Route path="/faculty" element={<Step1DepartmentPage />} />

              {/* 6-Step Flow */}
              <Route path={ROUTES.STEP2_YEAR_SEM} element={<Step2YearSemPage />} />
              <Route path={ROUTES.STEP3_SUBJECT} element={<Step3SubjectPage />} />
              <Route path={ROUTES.STEP4_EXAM} element={<Step4ExamTypePage />} />
              <Route path={ROUTES.STEP5_BUILDER} element={<Step5InteractiveBuilderPage />} />
              <Route path="/faculty/papers/:paperId/edit" element={<Step5InteractiveBuilderPage />} />
              <Route path={ROUTES.STEP6_HUB} element={<Step6PaperHubPage />} />
              <Route path="/faculty/papers" element={<Step6PaperHubPage />} />

              {/* Faculty Supporting Pages */}
              <Route path={ROUTES.FACULTY_QUESTION_BANK} element={<QuestionBankPage />} />
              <Route path={ROUTES.FACULTY_SYLLABUS} element={<SyllabusPage />} />
              <Route path={ROUTES.FACULTY_PROFILE} element={<FacultyProfilePage />} />

              {/* Auth Routes */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN_REVIEWS} element={<AdminReviewsPage />} />
              <Route path={ROUTES.ADMIN_PAPER_GENERATOR} element={<AdminPaperGeneratorPage />} />
              <Route path={ROUTES.ADMIN_EXAMS} element={<AdminExamsPage />} />
              <Route path={ROUTES.ADMIN_QUESTION_BANK} element={<AdminQuestionBankPage />} />
              <Route path={ROUTES.ADMIN_FACULTY} element={<AdminFacultyPage />} />
              <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
              <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfilePage />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}
