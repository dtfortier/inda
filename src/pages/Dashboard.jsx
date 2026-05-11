import WidgetCard from '../components/widgets/WidgetCard.jsx'
import ScopeSummary from '../components/dashboard/ScopeSummary.jsx'
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from '../data/widgetRegistry.jsx'
import './Dashboard.css'

/* Render one widget pulled from the registry. The same function powers
   the saved dashboard and the edit-mode rendering inside Customize.

   `opts.monitoring` is the full per-widget rules map; we slice off
   the rules for this id and pass them down to `render` and to the
   widget's insight function. `opts.editMode` and DnD props flow to
   the WidgetCard. */
export function renderRegistryWidget(id, opts = {}) {
  const def = WIDGET_REGISTRY[id]
  if (!def) return null

  const monitoring = (opts.monitoring && opts.monitoring[id]) || def.defaultMonitoring || []
  const renderArgs = { monitoring }

  /* `insight` may now be a function (monitoring-aware) or a string
     (static). Resolve here so WidgetCard always sees a string. */
  const insight = typeof def.insight === 'function' ? def.insight(renderArgs) : def.insight

  /* `tableData` is a thunk on the registry to defer table generation
     until needed (some generators are heavy). */
  const tableData = def.modal?.tableData ? def.modal.tableData() : undefined

  /* Pass through every prop except `monitoring`, which is internal. */
  const { monitoring: _ignored, ...rest } = opts

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
      {def.render ? def.render(renderArgs) : null}
    </WidgetCard>
  )
}

/* Walk the large column and pair adjacent half-size widgets so they
   render side-by-side in a `.widget-pair` row. */
function renderLargeColumn(layout, monitoring) {
  const out = []
  let i = 0
  while (i < layout.length) {
    const cur = layout[i]
    const nxt = layout[i + 1]
    if (cur.size === 'half' && nxt && nxt.size === 'half') {
      out.push(
        <div className="widget-pair" key={`pair-${cur.id}-${nxt.id}`}>
          {renderRegistryWidget(cur.id, { monitoring })}
          {renderRegistryWidget(nxt.id, { monitoring })}
        </div>
      )
      i += 2
    } else {
      out.push(<div key={`${cur.id}-${i}`}>{renderRegistryWidget(cur.id, { monitoring })}</div>)
      i += 1
    }
  }
  return out
}

export default function Dashboard({ config }) {
  const monitoring = config?.monitoring || {}
  /* Each dashboard can carry its own layout. New dashboards (or those
     never customized) fall back to the registry default. Per-column
     fallbacks make a partially-saved layout safe too. */
  const largeLayout = config?.layout?.large || DEFAULT_LAYOUT.large
  const mediumLayout = config?.layout?.medium || DEFAULT_LAYOUT.medium

  return (
    <div className="dashboard-scroll">
      <div className="dashboard-body">
        {config?.scope && (
          <div className="dashboard-scope-bar">
            <ScopeSummary scope={config.scope} />
          </div>
        )}
        <div className="dashboard-content">
          <div className="dashboard-col-large">
            {renderLargeColumn(largeLayout, monitoring)}
          </div>
          <div className="dashboard-col-medium">
            {mediumLayout.map((w) => (
              <div key={w.id}>{renderRegistryWidget(w.id, { monitoring })}</div>
            ))}
          </div>
        </div>
        <p className="dashboard-disclaimer">AI can make mistakes. Always double-check your data and insights.</p>
      </div>
    </div>
  )
}
