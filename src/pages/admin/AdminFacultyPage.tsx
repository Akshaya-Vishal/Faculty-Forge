import { useState } from 'react'
import { Mail, Plus, Search } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

export function AdminFacultyPage() {
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteDept, setInviteDept] = useState('Computer Science & Engineering')
  const [inviteRank, setInviteRank] = useState('Assistant Professor')

  const [facultyList, setFacultyList] = useState([
    {
      id: 'fac-101',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@facultyforge.edu',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      coursesAssigned: ['CS3301', 'CS3402'],
      papersSubmitted: 2,
      papersApproved: 1,
      status: 'Compliant',
    },
    {
      id: 'fac-102',
      name: 'Dr. Arvind Kumar',
      email: 'arvind.kumar@facultyforge.edu',
      department: 'Artificial Intelligence & Data Science',
      designation: 'Professor',
      coursesAssigned: ['AI3401'],
      papersSubmitted: 1,
      papersApproved: 1,
      status: 'Compliant',
    },
    {
      id: 'fac-103',
      name: 'Prof. Ananya Iyer',
      email: 'ananya.iyer@facultyforge.edu',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      coursesAssigned: ['IT3302'],
      papersSubmitted: 0,
      papersApproved: 0,
      status: 'Pending Submission',
    },
    {
      id: 'fac-104',
      name: 'Dr. Rajesh Pillai',
      email: 'rajesh.pillai@facultyforge.edu',
      department: 'Electronics & Communication',
      designation: 'Associate Professor',
      coursesAssigned: ['EC3302'],
      papersSubmitted: 1,
      papersApproved: 0,
      status: 'In Review',
    },
  ])

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) return

    setFacultyList((prev) => [
      ...prev,
      {
        id: `fac-${Date.now()}`,
        name: inviteName,
        email: inviteEmail,
        department: inviteDept,
        designation: inviteRank,
        coursesAssigned: ['CS3501'],
        papersSubmitted: 0,
        papersApproved: 0,
        status: 'Pending Submission',
      },
    ])

    showToast('success', 'Faculty Invited', `Invitation sent to ${inviteEmail}.`)
    setIsInviteModalOpen(false)
    setInviteName('')
    setInviteEmail('')
  }

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <AppLayout role="admin" pageTitle="Faculty Directory">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Faculty Directory & Allocations</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Course coordinator assignments and question paper submission compliance tracking.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsInviteModalOpen(true)}
            className="gap-2 bg-indigo-600 shadow-md text-xs"
          >
            <Plus className="size-4" />
            Add / Invite Faculty
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, department, or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9.5 pr-4 py-2 text-xs font-medium focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaculty.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm border border-indigo-200 shrink-0">
                    {f.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{f.designation}</p>
                    <p className="text-[11px] text-slate-500">{f.department}</p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    f.status === 'Compliant'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : f.status === 'In Review'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {f.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Courses:</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {f.coursesAssigned.map((code) => (
                      <span
                        key={code}
                        className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Submission Score:</span>
                  <span className="font-bold text-slate-800">
                    {f.papersApproved} Approved / {f.papersSubmitted} Submitted
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="size-3 text-slate-400" />
                  {f.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Add / Invite Faculty Coordinator"
        description="Register a new academic faculty member for question paper authoring."
        maxWidth="lg"
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty Full Name</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Sundaram"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="faculty@college.edu"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
              >
                <option value="Computer Science & Engineering">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Engg.</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <select
                value={inviteRank}
                onChange={(e) => setInviteRank(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
              >
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Head of Department">Head of Department (HOD)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-xs bg-indigo-600">
              Send Faculty Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
