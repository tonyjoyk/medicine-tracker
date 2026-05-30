import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import MedicineList from './MedicineList'
import HistoryList from './HistoryList'
import MedicineModal from './MedicineModal'
import SettingsModal from './SettingsModal'

const NAME_KEY = 'med_tracker_name'
const SUBTITLE_KEY = 'med_tracker_subtitle'

export default function HomeScreen({ accountCode }) {
  const [medicines, setMedicines] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState(() => localStorage.getItem(NAME_KEY) || 'My Medicines')
  const [userSubtitle, setUserSubtitle] = useState(() => localStorage.getItem(SUBTITLE_KEY) || '')

  const fetchData = useCallback(async () => {
    const [{ data: meds }, { data: snaps }] = await Promise.all([
      supabase.from('medicines').select('*').eq('is_active', true).eq('account_code', accountCode).order('created_at', { ascending: true }),
      supabase.from('snapshots').select('*').eq('account_code', accountCode).order('snapshot_date', { ascending: false }),
    ])
    setMedicines(meds || [])
    setSnapshots(snaps || [])
    setLoading(false)
    return meds || []
  }, [accountCode])

  async function saveSnapshot(activeMeds) {
    const today = new Date().toISOString().split('T')[0]
    const payload = activeMeds.map(m => ({ name: m.name, dose_mg: m.dose_mg }))
    await supabase.from('snapshots').upsert(
      { snapshot_date: today, account_code: accountCode, medicines: payload },
      { onConflict: 'snapshot_date,account_code' }
    )
  }

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setEditingMedicine(null)
    setModalOpen(true)
  }

  function openEdit(medicine) {
    setEditingMedicine(medicine)
    setModalOpen(true)
  }

  async function handleRemove(medicine) {
    await supabase.from('medicines').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', medicine.id)
    const meds = await fetchData()
    await saveSnapshot(meds.filter(m => m.id !== medicine.id))
  }

  async function handleSave(data, original) {
    if (original) {
      await supabase.from('medicines').update({
        name: data.name,
        dose_mg: data.dose_mg,
        frequency: data.frequency,
        updated_at: new Date().toISOString(),
      }).eq('id', original.id)
    } else {
      await supabase.from('medicines').insert({ name: data.name, dose_mg: data.dose_mg, frequency: data.frequency, account_code: accountCode })
    }
    setModalOpen(false)
    const meds = await fetchData()
    await saveSnapshot(meds)
  }

  function handleSaveSettings({ name, subtitle }) {
    localStorage.setItem(NAME_KEY, name)
    localStorage.setItem(SUBTITLE_KEY, subtitle)
    setUserName(name)
    setUserSubtitle(subtitle)
    setSettingsOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* App bar */}
      <div className="bg-[#0C3966] text-white px-4 pt-10 pb-4">
        <div className="max-w-md mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{userName}</h1>
            {userSubtitle && <p className="text-base text-blue-200 mt-0.5">{userSubtitle}</p>}
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="mt-1 p-1 rounded-full hover:bg-[#0C3966] active:bg-blue-500"
          >
            <GearIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-5">
        <MedicineList medicines={medicines} onEdit={openEdit} onRemove={handleRemove} onAdd={openAdd} />

        {snapshots.some(s => s.medicines.length > 0) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">My medicine history</h2>
            <HistoryList snapshots={snapshots} />
          </div>
        )}
      </div>

      {modalOpen && (
        <MedicineModal
          medicine={editingMedicine}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          onRemove={editingMedicine ? () => { handleRemove(editingMedicine); setModalOpen(false) } : null}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          name={userName}
          subtitle={userSubtitle}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
