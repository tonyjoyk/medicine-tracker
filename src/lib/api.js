// Small wrapper around the /api functions. Throws on any failed request
// so callers can show an error instead of pretending the save worked.
async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error("Couldn't connect. Check your internet and try again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

const q = (code) => `?code=${encodeURIComponent(code)}`

export const api = {
  getAccount: (code) => request(`/api/account${q(code)}`).then(d => d.account),
  createAccount: (code) => request('/api/account', { method: 'POST', body: { code } }).then(d => d.account),
  updateAccount: (code, { name, subtitle }) =>
    request('/api/account', { method: 'PATCH', body: { code, name, subtitle } }).then(d => d.account),

  listMedicines: (code) => request(`/api/medicines${q(code)}`).then(d => d.medicines),
  addMedicine: (code, med) => request('/api/medicines', { method: 'POST', body: { code, ...med } }),
  updateMedicine: (code, id, med) => request('/api/medicines', { method: 'PATCH', body: { code, id, ...med } }),
  removeMedicine: (code, id) => request('/api/medicines', { method: 'PATCH', body: { code, id, is_active: false } }),

  listSnapshots: (code) => request(`/api/snapshots${q(code)}`).then(d => d.snapshots),
  saveSnapshot: (code, snapshot_date, medicines) =>
    request('/api/snapshots', { method: 'PUT', body: { code, snapshot_date, medicines } }),
}
