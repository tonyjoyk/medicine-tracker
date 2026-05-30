import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('')
  const [screen, setScreen] = useState('enter') // 'enter' | 'confirm-create'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (pin.length !== 6) return
    setLoading(true)
    setError('')

    const { data } = await supabase.from('accounts').select('code').eq('code', pin).maybeSingle()

    setLoading(false)
    if (data) {
      onLogin(pin)
    } else {
      setScreen('confirm-create')
    }
  }

  async function handleCreate() {
    setLoading(true)
    await supabase.from('accounts').insert({ code: pin })
    setLoading(false)
    onLogin(pin)
  }

  if (screen === 'confirm-create') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">New account</h2>
        <p className="text-lg text-gray-500 text-center mb-8">
          No account found for <span className="font-semibold text-gray-800">{pin}</span>.{' '}
          Create a new account with this code?
        </p>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-[#0C3966] disabled:bg-gray-300 text-white text-base font-semibold py-4 rounded tracking-widest"
          >
            {loading ? 'Creating…' : 'CREATE ACCOUNT'}
          </button>
          <button
            onClick={() => { setScreen('enter'); setPin('') }}
            className="w-full border-2 border-gray-300 text-gray-700 text-base font-semibold py-4 rounded tracking-widest"
          >
            GO BACK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      {/* Top section: title + splash image (image overlaps into white) */}
      <div className="flex flex-col items-center pt-16 pb-0 relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Medicine Tracker</h1>
        <img
          src="/splash@3x.png"
          alt=""
          className="w-72 object-contain relative z-10 mb-[-80px]"
        />
      </div>

      {/* Bottom section: white with extra top padding to show image overlap */}
      <div className="flex-1 bg-white flex flex-col items-center px-6 pt-28">
        <p className="text-lg text-gray-500 mb-8 text-center">Enter a 6-digit code to continue</p>
        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setError('')
              setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
            }}
            placeholder="000000"
            className="text-center text-4xl tracking-widest border-2 border-gray-200 rounded-xl py-4 px-4 focus:outline-none focus:border-[#0C3966] text-gray-900 bg-white"
            autoFocus
          />
          {error && <p className="text-center text-red-600 text-lg font-medium">{error}</p>}
          <button
            type="submit"
            disabled={pin.length !== 6 || loading}
            className="bg-[#0C3966] disabled:bg-gray-300 text-white text-base font-semibold py-4 rounded tracking-widest"
          >
            {loading ? 'Checking…' : 'ENTER'}
          </button>
        </form>
      </div>
    </div>
  )
}
