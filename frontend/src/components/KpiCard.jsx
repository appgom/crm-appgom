export default function KpiCard({ icon, iconClass = 'bg-surface-container-high text-primary', label, value, hint, hintClass = 'text-text-muted' }) {
  return (
    <div className="bg-surface-card p-5 border border-border-subtle rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className="text-text-muted font-label-md uppercase tracking-wider">{label}</p>
      <h3 className="text-[28px] font-bold text-text-main mt-1">{value}</h3>
      {hint && <p className={`text-xs mt-4 font-medium ${hintClass}`}>{hint}</p>}
    </div>
  );
}
