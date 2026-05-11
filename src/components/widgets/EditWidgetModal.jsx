import { useEffect, useMemo, useState } from 'react'
import { WIDGET_REGISTRY, MONITORING_CONDITIONS } from '../../data/widgetRegistry.jsx'
import DataTable from './DataTable.jsx'
import './EditWidgetModal.css'

/* ── icons ─────────────────────────────────────────────────────────── */
function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

/* ── Filter UI for the Configuration tab ──────────────────────────── */

const FILTER_LABELS = {
  term: { label: 'Term', options: ['Spring 2026', 'Fall 2025', 'Summer 2025', 'Spring 2025', 'All active terms'] },
  'risk-level': { label: 'Risk Level', options: ['All Levels', 'High', 'Medium', 'Low'] },
  metric: { label: 'Metric', options: ['Low Engagement %', 'Instructor Inactivity %', 'At-Risk Students'] },
  visualization: { label: 'Display as', options: ['Chart', 'Table'] },
}

function FilterSelect({ filterKey, value, onChange }) {
  const def = FILTER_LABELS[filterKey]
  if (!def) return null
  return (
    <label className="ewm-filter">
      <span className="ewm-filter-label">{def.label}</span>
      <select
        className="ewm-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {def.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  )
}

/* ── Monitoring rule row ──────────────────────────────────────────── */

function MonitoringRow({ rule, metrics, onChange, onRemove }) {
  return (
    <div className="ewm-rule">
      <div className="ewm-rule-cell">
        <span className={`ewm-rule-tag ${rule.type}`}>
          {rule.type === 'goal' ? 'Goal' : 'Threshold'}
        </span>
      </div>
      <div className="ewm-rule-cell">
        <select
          className="ewm-rule-select"
          value={rule.metric}
          onChange={(e) => onChange({ ...rule, metric: e.target.value })}
        >
          {metrics.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="ewm-rule-cell">
        <select
          className="ewm-rule-select"
          value={rule.condition}
          onChange={(e) => onChange({ ...rule, condition: e.target.value })}
        >
          {MONITORING_CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="ewm-rule-cell">
        <div className="ewm-rule-target">
          <input
            type="number"
            className="ewm-rule-target-input"
            value={rule.target}
            onChange={(e) => onChange({ ...rule, target: Number(e.target.value) })}
          />
          {rule.unit && <span className="ewm-rule-unit">{rule.unit}</span>}
        </div>
      </div>
      <div className="ewm-rule-cell">
        <label className="ewm-rule-toggle">
          <input
            type="checkbox"
            checked={rule.alert}
            onChange={(e) => onChange({ ...rule, alert: e.target.checked })}
          />
          <span className="ewm-rule-toggle-slider" />
          <span className="ewm-rule-toggle-label">{rule.alert ? 'On' : 'Off'}</span>
        </label>
      </div>
      <div className="ewm-rule-cell ewm-rule-actions">
        <button
          type="button"
          className="ewm-rule-remove"
          aria-label="Remove rule"
          onClick={onRemove}
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  )
}

/* ── Save-changes confirmation overlay ────────────────────────────── */

function UnsavedChangesPrompt({ onSave, onDiscard, onCancel }) {
  return (
    <div className="ewm-prompt-overlay" role="dialog" aria-labelledby="ewm-prompt-title">
      <div className="ewm-prompt">
        <div className="ewm-prompt-icon" aria-hidden="true">
          <WarningIcon />
        </div>
        <h3 id="ewm-prompt-title" className="ewm-prompt-title">Save changes?</h3>
        <p className="ewm-prompt-body">You have unsaved changes to this widget.</p>
        <div className="ewm-prompt-actions">
          <button type="button" className="ewm-btn primary block" onClick={onSave}>
            Save changes
          </button>
          <button type="button" className="ewm-btn tertiary block" onClick={onDiscard}>
            Discard changes
          </button>
          <button type="button" className="ewm-btn ghost block" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main modal ───────────────────────────────────────────────────── */

export default function EditWidgetModal({ widgetId, currentRules, currentDisplayMode, onClose, onRemove, onSave }) {
  const def = widgetId ? WIDGET_REGISTRY[widgetId] : null
  const [tab, setTab] = useState('config')
  const [filterValues, setFilterValues] = useState({})
  const [rules, setRules] = useState([])
  const [showPrompt, setShowPrompt] = useState(false)
  /* 'chart' or 'table' — which view shows as the widget's primary body
     on the dashboard. Defaults to chart; table only available when the
     widget has tableData configured in the registry. */
  const [displayMode, setDisplayMode] = useState('chart')

  /* Seed the rules state from currentRules (saved by the user) when
     present, otherwise fall back to the registry's defaultMonitoring.
     This way reopening the modal preserves prior edits. */
  const seedRules = (def, current) => {
    const source = Array.isArray(current) && current.length > 0
      ? current
      : (def?.defaultMonitoring || [])
    return source.map((r, i) => ({ id: r.id || `r-${i}`, ...r }))
  }

  /* Reseed when the modal opens for a different widget. */
  useEffect(() => {
    if (!widgetId || !def) return
    setTab('config')
    setShowPrompt(false)
    /* Sensible defaults per filter. Visualization defaults to "Chart". */
    const initialFilters = {}
    for (const f of def.filters || []) {
      initialFilters[f] = FILTER_LABELS[f]?.options[0] || ''
    }
    setFilterValues(initialFilters)
    setRules(seedRules(def, currentRules))
    setDisplayMode(currentDisplayMode === 'table' ? 'table' : 'chart')
  }, [widgetId, def, currentRules, currentDisplayMode])

  const initialFilters = useMemo(() => {
    if (!def) return {}
    const out = {}
    for (const f of def.filters || []) out[f] = FILTER_LABELS[f]?.options[0] || ''
    return out
  }, [def])

  const initialRules = useMemo(
    () => seedRules(def, currentRules),
    [def, currentRules]
  )

  const initialDisplayMode = currentDisplayMode === 'table' ? 'table' : 'chart'

  /* `dirty` is true if filters, rules, or display mode diverge from
     their initial state. Used to gate the unsaved-changes prompt. */
  const dirty = useMemo(() => {
    if (JSON.stringify(filterValues) !== JSON.stringify(initialFilters)) return true
    if (JSON.stringify(rules) !== JSON.stringify(initialRules)) return true
    if (displayMode !== initialDisplayMode) return true
    return false
  }, [filterValues, rules, displayMode, initialFilters, initialRules, initialDisplayMode])

  if (!widgetId || !def) return null

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        type: 'goal',
        metric: def.metrics?.[0] || 'Metric',
        condition: 'Greater than',
        target: 0,
        unit: '',
        alert: false,
      },
    ])
  }

  const handleRuleChange = (id, next) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...next, id } : r)))
  }

  const handleRuleRemove = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const handleClose = () => {
    if (dirty) setShowPrompt(true)
    else onClose()
  }

  const handleSave = () => {
    /* Persist rules + display mode through the parent so the dashboard
       reflects changes (status badges, dynamic insight text, chart-vs-
       table rendering) immediately. Filter selections are still
       preview-only in this iteration. */
    if (onSave) {
      /* Strip the React-internal `id` field; rules survive in storage
         identified by metric+condition+target. */
      const cleanedRules = rules.map(({ id: _id, ...r }) => r)
      onSave({ rules: cleanedRules, displayMode })
    } else {
      onClose()
    }
  }

  const handleDiscard = () => {
    setShowPrompt(false)
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  /* Use whichever metric list is available — fall back to a generic
     placeholder if the registry didn't list any. */
  const availableMetrics = def.metrics && def.metrics.length > 0
    ? def.metrics
    : ['Metric A', 'Metric B', 'Metric C']

  return (
    <div className="ewm-backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <div className="ewm-modal" role="dialog" aria-labelledby="ewm-title" aria-modal="true">
        <header className="ewm-header">
          <div className="ewm-header-text">
            <h2 id="ewm-title" className="ewm-title">Edit widget: {def.title}</h2>
            <p className="ewm-subtitle">All filters apply within the global scope only.</p>
          </div>
          <button type="button" className="ewm-close" aria-label="Close" onClick={handleClose}>
            <XIcon size={16} />
          </button>
        </header>

        <div className="ewm-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'config'}
            className={`ewm-tab${tab === 'config' ? ' active' : ''}`}
            onClick={() => setTab('config')}
          >
            Configuration
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'monitoring'}
            className={`ewm-tab${tab === 'monitoring' ? ' active' : ''}`}
            onClick={() => setTab('monitoring')}
          >
            Monitoring
          </button>
        </div>

        <div className="ewm-body">
          {tab === 'config' && (() => {
            /* A widget can render as a table only if the registry
               has tableData configured. Otherwise the Table option in
               the segmented control is disabled. */
            const hasTableData = !!def.modal?.tableData
            const tableData = (hasTableData && displayMode === 'table')
              ? def.modal.tableData()
              : null
            return (
              <>
                <div className="ewm-section-label">Display as</div>
                <div className="ewm-segmented" role="radiogroup" aria-label="Display as">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={displayMode === 'chart'}
                    className={`ewm-segmented-btn${displayMode === 'chart' ? ' active' : ''}`}
                    onClick={() => setDisplayMode('chart')}
                  >
                    Chart
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={displayMode === 'table'}
                    className={`ewm-segmented-btn${displayMode === 'table' ? ' active' : ''}`}
                    onClick={() => hasTableData && setDisplayMode('table')}
                    disabled={!hasTableData}
                    title={hasTableData ? '' : 'Table view not available for this widget yet'}
                  >
                    Table
                  </button>
                </div>
                {!hasTableData && (
                  <p className="ewm-helper-text" style={{ marginTop: 6 }}>
                    Table view isn't available for this widget yet.
                  </p>
                )}

                <div className="ewm-section-label" style={{ marginTop: 24 }}>Filters</div>
                <div className="ewm-filter-grid">
                  {(def.filters || []).map((f) => (
                    <FilterSelect
                      key={f}
                      filterKey={f}
                      value={filterValues[f] || ''}
                      onChange={(value) =>
                        setFilterValues((prev) => ({ ...prev, [f]: value }))
                      }
                    />
                  ))}
                </div>

                <div className="ewm-section-label" style={{ marginTop: 24 }}>Preview</div>
                <div className="ewm-preview">
                  {tableData ? (
                    <div className="ewm-preview-table">
                      <DataTable columns={tableData.columns} rows={tableData.rows.slice(0, 6)} />
                    </div>
                  ) : def.render ? (
                    def.render()
                  ) : (
                    <div className="ewm-preview-placeholder">No preview available.</div>
                  )}
                </div>
              </>
            )
          })()}

          {tab === 'monitoring' && (
            <>
              <div className="ewm-section-row">
                <div>
                  <div className="ewm-section-label">Goals & Thresholds</div>
                  <p className="ewm-helper-text">
                    Define what you care about being tracked. Alerts surface
                    on the widget when a rule is met.
                  </p>
                </div>
                <button type="button" className="ewm-btn secondary small" onClick={handleAddRule}>
                  <PlusIcon /> Add goal or threshold
                </button>
              </div>

              {rules.length === 0 ? (
                <div className="ewm-empty">No goals or thresholds yet.</div>
              ) : (
                <div className="ewm-rules">
                  <div className="ewm-rule head">
                    <div className="ewm-rule-cell">Type</div>
                    <div className="ewm-rule-cell">Metric</div>
                    <div className="ewm-rule-cell">Condition</div>
                    <div className="ewm-rule-cell">Target</div>
                    <div className="ewm-rule-cell">Alert</div>
                    <div className="ewm-rule-cell" />
                  </div>
                  {rules.map((rule) => (
                    <MonitoringRow
                      key={rule.id}
                      rule={rule}
                      metrics={availableMetrics}
                      onChange={(next) => handleRuleChange(rule.id, next)}
                      onRemove={() => handleRuleRemove(rule.id)}
                    />
                  ))}
                </div>
              )}

              <div className="ewm-info-banner">
                <InfoIcon />
                <span>
                  Alerts are checked daily and will notify users with access to this dashboard.
                </span>
              </div>
            </>
          )}
        </div>

        <footer className="ewm-footer">
          <button type="button" className="ewm-btn danger-text" onClick={onRemove}>
            Remove widget
          </button>
          <div className="ewm-footer-actions">
            <button type="button" className="ewm-btn tertiary" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className="ewm-btn primary" onClick={handleSave}>
              Save changes
            </button>
          </div>
        </footer>

        {showPrompt && (
          <UnsavedChangesPrompt
            onSave={handleSave}
            onDiscard={handleDiscard}
            onCancel={() => setShowPrompt(false)}
          />
        )}
      </div>
    </div>
  )
}
