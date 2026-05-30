export default function MedicineList({ medicines, onEdit, onRemove, onAdd }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Card heading */}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-2xl font-bold text-gray-900">My medicines</h2>
      </div>

      {/* Medicine rows */}
      {medicines.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {medicines.map((med) => (
            <li
              key={med.id}
              onClick={() => onEdit(med)}
              className="flex items-center gap-4 px-4 py-4 active:bg-gray-50 cursor-pointer"
            >
              <PillIcon />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-semibold text-gray-900 truncate">
                  {med.name}{med.dose_mg ? ` ${med.dose_mg}mg` : ''}
                </p>
                <p className="text-base text-gray-500 mt-0.5">{med.frequency}</p>
              </div>
              <ChevronIcon />
            </li>
          ))}
        </ul>
      )}

      {/* Add button */}
      <div className="px-4 py-4">
        <button
          onClick={onAdd}
          className="w-full py-3 text-sm font-bold text-blue-500 tracking-widest bg-blue-50 rounded-lg shadow-[0_3px_0_0_#bfdbfe] active:shadow-none active:translate-y-[2px] transition-transform"
        >
          ADD MEDICINE
        </button>
      </div>
    </div>
  )
}

function PillIcon() {
  return (
    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
      <img src="/pill.png" alt="" className="w-12 h-12 object-contain" />
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
