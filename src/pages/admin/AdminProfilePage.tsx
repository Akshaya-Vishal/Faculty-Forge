import { useState } from 'react'
import { Building2, Save, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'

export function AdminProfilePage() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name || 'Prof. Robert Vance')
  const [email, setEmail] = useState(user?.email || 'robert.vance@facultyforge.edu')
  const [designation, setDesignation] = useState(user?.designation || 'Controller of Examinations (CoE)')
  const [college, setCollege] = useState(user?.college || 'St. Xavier Institute of Engineering & Technology (Autonomous)')
  const [phone, setPhone] = useState(user?.phone || '+91 98401 99999')

  const [affiliation, setAffiliation] = useState('Affiliated to Anna University, Approved by AICTE')
  const [coeSignatureLabel, setCoeSignatureLabel] = useState('Controller of Examinations')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name,
      email,
      designation,
      college,
      phone,
    })
    showToast('success', 'Settings Saved', 'Controller of Examinations settings updated.')
  }

  return (
    <AppLayout role="admin" pageTitle="Admin Settings & University Template">
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Admin Profile & University Template Settings
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure examination authority credentials and official question paper header templates.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
          <div className="size-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-900/20 shrink-0">
            <ShieldCheck className="size-10 text-indigo-400" />
          </div>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-extrabold text-slate-900">{name}</h3>
              <span className="rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
                Examination Authority
              </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600">{designation}</p>
            <p className="text-xs text-slate-500">{college}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="size-4 text-indigo-600" />
              Examination Controller Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Office Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="size-4 text-indigo-600" />
              University Question Paper Header Template
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Affiliation & Accreditation Tagline</label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Signatory Label</label>
                <input
                  type="text"
                  value={coeSignatureLabel}
                  onChange={(e) => setCoeSignatureLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" className="gap-2 text-xs bg-indigo-600">
                <Save className="size-4" />
                Save Institutional Settings
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
