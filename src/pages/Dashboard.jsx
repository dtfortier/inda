import WidgetCard from '../components/widgets/WidgetCard.jsx'
import DataTable from '../components/widgets/DataTable.jsx'
import ScopeSummary from '../components/dashboard/ScopeSummary.jsx'
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from '../data/widgetRegistry.jsx'
import './Dashboard.css'

export function renderRegistryWidget(id, opts = {}) {
  const def = WIDGET_REGISTRY[id]
  if (!def) return null

  const monitoring = (opts.monitoring && opts.monitoring[id]) || def.defaultMonitoring || []
  const renderArgs = { monitoring }

  const insight = typeof def.insight === 'function' ? def.insight(renderArgs) : def.insight

  const tableData = def.modal?.tableData ? def.modal.tableData() : undefined

  const displayMode = opts.display?.[id] === 'table' && tableData ? 'table' : 'chart'

  let body
  if (displayMode === 'table') {
    body = (
      <div className="widget-table-body">
        <DataTable columns={tableData.columns} rows={tableData.rows} />
      </div>
    )
  } else {
    body = def.render ? def.render(renderArgs) : null
  }

  const { monitoring: _m, display: _d, ...rest } = opts

  return (
    <WidgetCard
      title={def.title}
      insight={insight}
      modalContent={def.renderModal ? def.renderModal() : undefined}
      modalFilters={def.modal?.filters}
      modalMethodology={def.modal?.methodology}
      modalAiSummary={def.modal?.aiSummary}
      modalTableData={tableData}
      {...rest}
    >
      {body}
    </WidgetCard>
  )
}

function renderLargeColumn(layout, monitoring, display) {
  const out = []
  let i = 0
  while (i < layout.length) {
    const cur = layout[i]
    const nxt = layout[i + 1]
    if (cur.size === 'half' && nxt && nxt.size === 'half') {
      out.push(
        <div className="widget-pair" key={`pair-${cur.id}-${nxt.id}`}>
          {renderRegistryWidget(cur.id, { monitoring, display })}
          {renderRegistryWidget(nxt.id, { monitoring, display })}
        </div>
      )
      i += 2
    } else {
      out.push(<div key={`${cur.id}-${i}`}>{renderRegistryWidget(cur.id, { monitoring, display })}</div>)
      i += 1
    }
  }
  return out
}

/* ── Audience banner — only shown for assigned dashboards ──── */
const AssignedUserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)

function AudienceBanner({ audience }) {
  // Only render for dashboards assigned to someone other than myself
  if (!audience || audience.id === 'myself') return null
  return (
    <div className="dashboard-audience-banner">
      <span className="dashboard-audience-icon"><AssignedUserIcon /></span>
      <span className="dashboard-audience-text">
        Assigned to <strong>{audience.label}</strong>
        {audience.role && (
          <span className="dashboard-audience-role"> · {audience.role}</span>
        )}
      </span>
    </div>
  )
}

export default function Dashboard({ config, audience }) {
  const monitoring = config?.monitoring || {}
  const display    = config?.display    || {}
  const largeLayout  = config?.layout?.large  || DEFAULT_LAYOUT.large
  const mediumLayout = config?.layout?.medium || DEFAULT_LAYOUT.medium

  return (
    <div className="dashboard-scroll">
      <div className="dashboard-body">

        {/* Audience banner — assigned dashboards only */}
        <AudienceBanner audience={audience} />

        {/* Scope summary bar */}
        {config?.scope && (
          <div className="dashboard-scope-bar">
            <ScopeSummary scope={config.scope} />
          </div>
        )}

        <div className="dashboard-content">
          <div className="dashboard-col-large">
            {renderLargeColumn(largeLayout, monitoring, display)}
          </div>
          <div className="dashboard-col-medium">
            {mediumLayout.map((w) => (
              <div key={w.id}>{renderRegistryWidget(w.id, { monitoring, display })}</div>
            ))}
          </div>
        </div>
        <p className="dashboard-disclaimer">AI can make mistakes. Always double-check your data and insights.</p>
      </div>
    </div>
  )
}
