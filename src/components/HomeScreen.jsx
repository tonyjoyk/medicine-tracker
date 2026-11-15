import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
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
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [userName, setUserName] = useState(() => localStorage.getItem(NAME_KEY) || 'My Medicines')
  const [userSubtitle, setUserSubtitle] = useState(() => localStorage.getItem(SUBTITLE_KEY) || '')

  // Throws on failure; callers decide how to show the error.
  const fetchData = useCallback(async () => {
    const [meds, snaps] = await Promise.all([
      api.listMedicines(accountCode),
      api.listSnapshots(accountCode),
    ])
    setMedicines(meds)
    setSnapshots(snaps)
    return meds
  }, [accountCode])

  async function saveSnapshot(activeMeds) {
    const today = new Date().toISOString().split('T')[0]
    const payload = activeMeds.map(m => ({ name: m.name, dose_mg: m.dose_mg }))
    await api.saveSnapshot(accountCode, today, payload)
    setSnapshots(await api.listSnapshots(accountCode))
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [, account] = await Promise.all([fetchData(), api.getAccount(accountCode)])
      // The backend is the source of truth for name/Patient ID; localStorage is only a fallback.
      if (account?.name) {
        setUserName(account.name)
        localStorage.setItem(NAME_KEY, account.name)
      }
      if (account?.subtitle != null) {
        setUserSubtitle(account.subtitle)
        localStorage.setItem(SUBTITLE_KEY, account.subtitle)
      }
    } catch (err) {
      setLoadError(err.message)
    }
    setLoading(false)
  }, [fetchData, accountCode])

  useEffect(() => { loadAll() }, [loadAll])

  function openAdd() {
    setEditingMedicine(null)
    setModalOpen(true)
  }

  function openEdit(medicine) {
    setEditingMedicine(medicine)
    setModalOpen(true)
  }

  async function handleRemove(medicine) {
    setError('')
    try {
      await api.removeMedicine(accountCode, medicine.id)
      const meds = await fetchData()
      await saveSnapshot(meds.filter(m => m.id !== medicine.id))
    } catch (err) {
      setError(`Couldn't remove ${medicine.name}. ${err.message}`)
    }
  }

  async function handleSave(data, original) {
    setError('')
    const med = { name: data.name, dose_mg: data.dose_mg, frequency: data.frequency }
    try {
      if (original) {
        const { medicine } = await api.updateMedicine(accountCode, original.id, med)
        setMedicines(prev => prev.map(m => (m.id === medicine.id ? medicine : m)))
      } else {
        // Show the saved medicine right away instead of waiting for the full reload below.
        const { medicine } = await api.addMedicine(accountCode, med)
        setMedicines(prev => [...prev, medicine])
      }
    } catch (err) {
      // Keep the modal open so nothing the user typed is lost.
      setError(`Couldn't save ${data.name}. ${err.message}`)
      return
    }
    setModalOpen(false)
    try {
      const meds = await fetchData()
      await saveSnapshot(meds)
    } catch (err) {
      setError(`Saved, but couldn't refresh your list. ${err.message}`)
    }
  }

  async function handleSaveSettings({ name, subtitle }) {
    setError('')
    try {
      await api.updateAccount(accountCode, { name, subtitle })
    } catch (err) {
      setError(`Couldn't save settings. ${err.message}`)
      return
    }
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

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 gap-6">
        <p className="text-xl text-red-600 text-center">Couldn't load your medicines. {loadError}</p>
        <button
          onClick={loadAll}
          className="bg-[#0C3966] text-white text-base font-semibold py-4 px-8 rounded tracking-widest"
        >
          TRY AGAIN
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {error && (
        <div role="alert" className="fixed top-0 inset-x-0 z-[60] bg-red-600 text-white px-4 py-3">
          <div className="max-w-md mx-auto flex items-start gap-3">
            <p className="flex-1 text-base">{error}</p>
            <button onClick={() => setError('')} aria-label="Dismiss" className="font-bold">✕</button>
          </div>
        </div>
      )}

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
