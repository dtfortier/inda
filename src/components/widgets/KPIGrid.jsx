import './KPIGrid.css'

export default function KPIGrid({ metrics, showDescription = false, columns }) {
  const style = columns ? { '--kpi-columns': columns } : undefined
  return (
    <div className={`kpi-grid${columns ? ' kpi-grid-cols' : ''}`} style={style}>
      {metrics.map((m, i) => (
        <div key={i} className="kpi-item">
          <p className="kpi-label">{m.label}</p>
          <p className="kpi-value">{m.value}</p>
          {showDescription && m.description && (
            <p className="kpi-desc">{m.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
