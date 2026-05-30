import { useState, useRef, useEffect } from 'react'
import drugNames from '../data/drugNames'

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'Once a week',
  'As needed',
]

export default function MedicineModal({ medicine, onSave, onClose, onRemove }) {
  const isEdit = Boolean(medicine)

  const [name, setName] = useState(medicine?.name || '')
  const [dose, setDose] = useState(medicine?.dose_mg ?? '')
  const [frequency, setFrequency] = useState(medicine?.frequency || FREQUENCIES[0])
  const [suggestions, setSuggestions] = useState([])
  const [saving, setSaving] = useState(false)
  const nameInputRef = useRef(null)

  useEffect(() => { nameInputRef.current?.focus() }, [])

  function handleNameChange(val) {
    setName(val)
    setSuggestions(
      val.length >= 2
        ? drugNames.filter((d) => d.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
        : []
    )
  }

  function selectSuggestion(drug) {
    setName(drug)
    setSuggestions([])
  }

  // Edit mode: auto-save a single field change immediately
  async function autoSave(patch) {
    setSaving(true)
    await onSave(
      { name: medicine.name, dose_mg: dose ? Number(dose) : null, frequency, ...patch },
      medicine
    )
    setSaving(false)
  }

  async function handleFrequencyChange(val) {
    setFrequency(val)
    if (isEdit) await autoSave({ frequency: val })
  }

  async function handleDoseBlur() {
    if (isEdit) await autoSave({ dose_mg: dose ? Number(dose) : null })
  }

  // Add mode: explicit submit
  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), dose_mg: dose ? Number(dose) : null, frequency }, null)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative bg-white rounded-t-2xl max-w-md w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0C3966] rounded-t-2xl px-4 py-4 flex items-center gap-3">
          <button onClick={onClose} className="text-white p-1 -ml-1" aria-label="Close">
            <BackIcon />
          </button>
          <h2 className="text-xl font-medium text-white flex-1">
            {medicine ? medicine.name : 'Add medicine'}
          </h2>
          {saving && <span className="text-blue-200 text-sm">Saving…</span>}
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-0">
          {/* Name field — add mode only */}
          {!isEdit && (
            <div className="relative mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Medicine name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Amlodipine"
                className="w-full border-b-2 border-gray-200 focus:border-[#0C3966] py-2 text-lg text-gray-900 focus:outline-none bg-transparent"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg overflow-hidden">
                  {suggestions.map((drug) => (
                    <li
                      key={drug}
                      onMouseDown={() => selectSuggestion(drug)}
                      className="px-4 py-3 text-lg text-gray-900 active:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      {drug}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Frequency */}
          <SettingRow label="Frequency">
            <select
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="text-right text-lg text-blue-600 font-medium focus:outline-none bg-transparent appearance-none cursor-pointer"
            >
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </SettingRow>

          {/* Dose */}
          <SettingRow label="Dose">
            <div className="flex items-center gap-1">
              <input
                type="number"
                inputMode="decimal"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                onBlur={handleDoseBlur}
                placeholder="–"
                min="0"
                className="w-20 text-right text-lg text-blue-600 font-medium focus:outline-none bg-transparent"
              />
              <span className="text-lg text-blue-600 font-medium">mg</span>
            </div>
          </SettingRow>

          {/* DONE — add mode only */}
          {!isEdit && (
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="mt-6 w-full bg-[#0C3966] disabled:bg-gray-200 disabled:text-gray-400 text-white text-base font-semibold py-4 rounded tracking-widest"
            >
              {saving ? 'SAVING…' : 'DONE'}
            </button>
          )}

          {/* Delete — edit mode only */}
          {onRemove && (
            <button
              type="button"
              onClick={() => { if (window.confirm(`Remove ${medicine.name}?`)) onRemove() }}
              className="mt-4 w-full py-3 text-sm font-semibold text-red-500 tracking-widest"
            >
              DELETE MEDICINE
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <span className="text-lg text-gray-800">{label}</span>
      {children}
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
