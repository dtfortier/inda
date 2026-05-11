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

export default function Dashboard({ config, audience }) {
  const monitoring   = config?.monitoring || {}
  const display      = config?.display    || {}
  const largeLayout  = config?.layout?.large  || DEFAULT_LAYOUT.large
  const mediumLayout = config?.layout?.medium || DEFAULT_LAYOUT.medium

  // Show scope card if there's scope data OR an assigned audience
  const showScopeCard = config?.scope || (audience && audience.id !== 'myself')

  return (
    <div className="dashboard-scroll">
      <div className="dashboard-body">
        {showScopeCard && (
          <div className="dashboard-scope-bar">
            <ScopeSummary scope={config?.scope} audience={audience} />
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
