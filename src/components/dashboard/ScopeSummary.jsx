import { useState } from 'react'
import { SCOPE_FIELDS } from '../../data/mock/onboardingOptions.js'
import './ScopeSummary.css'

const PLURAL_LABEL = {
  subAccounts:   'sub-accounts',
  term:          'terms',
  studentGroups: 'student groups',
  courses:       'courses',
  courseGroups:  'course groups',
  instructors:   'instructors',
  modality:      'modalities',
}

const MAX_VISIBLE_CHIPS = 5

function buildSummaryParts(scope) {
  const parts = []
  for (const field of SCOPE_FIELDS) {
    const items = scope?.[field.key] || []
    if (items.length === 0) continue
    if (items.length <= 2) {
      parts.push(items.join(', '))
    } else {
      parts.push(`${items.length} ${PLURAL_LABEL[field.key] || field.label.toLowerCase()}`)
    }
  }
  return parts
}

const AssignedUserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)

export default function ScopeSummary({ scope, audience }) {
  const [expanded, setExpanded] = useState(false)
  const parts = buildSummaryParts(scope)

  const isAssigned = audience && audience.id !== 'myself'

  if (parts.length === 0 && !isAssigned) return null

  const fieldsWithItems = SCOPE_FIELDS.filter((f) => (scope?.[f.key] || []).length > 0)

  return (
    <section className="scope-summary" aria-label="Dashboard scope">

      {/* Audience line — only for assigned dashboards, sits above scope */}
      {isAssigned && (
        <div className="scope-summary-audience">
          <span className="scope-summary-audience-icon"><AssignedUserIcon /></span>
          <span className="scope-summary-audience-text">
            Assigned to <strong>{audience.label}</strong>
            {audience.role && (
              <span className="scope-summary-audience-role"> · {audience.role}</span>
            )}
          </span>
        </div>
      )}

      {/* Scope line — only render when there are scope selections */}
      {parts.length > 0 && (
        <div className={`scope-summary-header${isAssigned ? ' scope-summary-header--with-audience' : ''}`}>
          <span className="scope-summary-pill">Scope</span>
          <span className="scope-summary-divider" aria-hidden="true" />
          <div className="scope-summary-line">
            {parts.map((part, i) => (
              <span key={i} className="scope-summary-part">
                {part}
                {i < parts.length - 1 && <span className="scope-summary-sep"> · </span>}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="scope-summary-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Collapse' : 'View all'}
          </button>
        </div>
      )}

      {expanded && (
        <>
          <div className="scope-summary-rule" aria-hidden="true" />
          <div className="scope-summary-grid">
            {fieldsWithItems.map((field) => {
              const items = scope[field.key]
              const visible = items.slice(0, MAX_VISIBLE_CHIPS)
              const overflow = items.length - visible.length
              return (
                <div key={field.key} className="scope-summary-cell">
                  <div className="scope-summary-label">{field.label}</div>
                  <div className="scope-summary-chips">
                    {visible.map((item) => (
                      <span key={item} className="scope-summary-chip">{item}</span>
                    ))}
                    {overflow > 0 && (
                      <span className="scope-summary-chip more">+{overflow} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="scope-summary-footer">
            <span className="scope-summary-hint">
              Scope is read-only here. Go to Edit Dashboard to make changes.
            </span>
            <button
              type="button"
              className="scope-summary-toggle"
              onClick={() => setExpanded(false)}
            >
              Collapse <span aria-hidden="true">↑</span>
            </button>
          </div>
        </>
      )}
    </section>
  )
}
