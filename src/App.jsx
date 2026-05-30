import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import HomeScreen from './components/HomeScreen'

const AUTH_KEY = 'med_tracker_auth'

export default function App() {
  const [accountCode, setAccountCode] = useState(() => localStorage.getItem(AUTH_KEY) || null)

  function handleLogin(code) {
    localStorage.setItem(AUTH_KEY, code)
    setAccountCode(code)
  }

  return accountCode
    ? <HomeScreen accountCode={accountCode} />
    : <LoginScreen onLogin={handleLogin} />
}
