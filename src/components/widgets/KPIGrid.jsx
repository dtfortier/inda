import MetricStatusBadge from './MetricStatusBadge.jsx'
import './KPIGrid.css'

/* KPIGrid — block of label/value pairs.
   `statuses` (optional) is a map of metric label → { status, rule, value }
   produced by the monitoring engine. Empty/missing → no badge, grid
   renders identically to before. */
export default function KPIGrid({ metrics, showDescription = false, columns, statuses }) {
  const style = columns ? { '--kpi-columns': columns } : undefined
  return (
    <div className={`kpi-grid${columns ? ' kpi-grid-cols' : ''}`} style={style}>
      {metrics.map((m, i) => {
        const entry = statuses?.[m.label]
        return (
          <div key={i} className="kpi-item">
            <p className="kpi-label">{m.label}</p>
            <p className="kpi-value">{m.value}</p>
            {entry && (
              <div className="kpi-status">
                <MetricStatusBadge status={entry.status} />
              </div>
            )}
            {showDescription && m.description && (
              <p className="kpi-desc">{m.description}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
