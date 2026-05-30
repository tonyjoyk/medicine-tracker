import { useState } from 'react'

export default function SettingsModal({ name, subtitle, onSave, onClose }) {
  const [nameVal, setNameVal] = useState(name)
  const [subtitleVal, setSubtitleVal] = useState(subtitle)

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ name: nameVal.trim() || 'My Medicines', subtitle: subtitleVal.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-t-2xl max-w-md w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0C3966] rounded-t-2xl px-4 py-4 flex items-center gap-3">
          <button onClick={onClose} className="text-white p-1 -ml-1" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-xl font-medium text-white">Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Name</label>
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              placeholder="Your name"
              className="w-full border-b-2 border-gray-200 focus:border-[#0C3966] py-2 text-lg text-gray-900 focus:outline-none bg-transparent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Patient ID</label>
            <input
              type="text"
              value={subtitleVal}
              onChange={(e) => setSubtitleVal(e.target.value)}
              placeholder="1234567890"
              className="w-full border-b-2 border-gray-200 focus:border-[#0C3966] py-2 text-lg text-gray-900 focus:outline-none bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full bg-[#0C3966] text-white text-base font-semibold py-4 rounded tracking-widest"
          >
            SAVE
          </button>
        </form>
      </div>
    </div>
  )
}
