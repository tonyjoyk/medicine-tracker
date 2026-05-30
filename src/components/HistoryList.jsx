export default function HistoryList({ snapshots }) {
  if (snapshots.length === 0) {
    return <p className="text-lg text-gray-400">No history yet.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {snapshots.filter(snap => snap.medicines.length > 0).map((snap) => {
        const label = new Date(snap.snapshot_date + 'T00:00:00').toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        }).toUpperCase()

        return (
          <div key={snap.snapshot_date} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-500 tracking-wide">{label}</p>
            </div>
            <ul className="divide-y divide-gray-100">
              {snap.medicines.length === 0 ? (
                <li className="px-4 py-3 text-base text-gray-400">No medicines</li>
              ) : (
                snap.medicines.map((med, i) => (
                  <li key={i} className="px-4 py-3">
                    <p className="text-base text-gray-800">
                      {med.name}{med.dose_mg ? ` ${med.dose_mg}mg` : ''}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
