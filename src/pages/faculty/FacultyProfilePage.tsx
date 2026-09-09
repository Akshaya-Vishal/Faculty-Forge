import { useState } from 'react'
import { Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'

export function FacultyProfilePage() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name || 'Dr. Sarah Jenkins')
  const [email, setEmail] = useState(user?.email || 'sarah.jenkins@facultyforge.edu')
  const [designation, setDesignation] = useState(user?.designation || 'Associate Professor')
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering')
  const [phone, setPhone] = useState(user?.phone || '+91 98401 23456')
  const [specialization, setSpecialization] = useState(user?.specialization || 'Algorithms, Distributed Systems')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name,
      email,
      designation,
      department,
      phone,
      specialization,
    })
    showToast('success', 'Profile Updated', 'Your faculty account details have been saved.')
  }

  return (
    <AppLayout role="faculty" pageTitle="Faculty Profile & Preferences">
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Faculty Profile Settings</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your academic credentials, departmental allocations, and contact preferences.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
          <div className="size-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-200 shrink-0">
            {name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-extrabold text-slate-900">{name}</h3>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                Verified Faculty
              </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600">{designation}</p>
            <p className="text-xs text-slate-500">
              Dept. of {department} &bull; ID: <b>{user?.employeeId || 'CSE-FAC-2018-042'}</b>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Academic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation / Rank</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" className="gap-2 text-xs bg-indigo-600">
              <Save className="size-4" />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
