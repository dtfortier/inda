import { useState } from 'react'
import { SCOPE_FIELDS } from '../../data/mock/onboardingOptions.js'
import './ScopeSummary.css'

/* For the summary line, render the field label in lowercase plural form
   so "3 sub-accounts" reads naturally next to literal item lists like
   "Spring 2025, Winter 2025". `Term` and `Modality` need irregulars. */
const PLURAL_LABEL = {
  subAccounts: 'sub-accounts',
  term: 'terms',
  studentGroups: 'student groups',
  courses: 'courses',
  courseGroups: 'course groups',
  instructors: 'instructors',
  modality: 'modalities',
}

/* Cap chips per category in the expanded grid; the rest collapse into a
   "+N more" pill. Matches the "+42 more" affordance in the mockup. */
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

export default function ScopeSummary({ scope }) {
  const [expanded, setExpanded] = useState(false)
  const parts = buildSummaryParts(scope)

  /* If the user finished onboarding without selecting any scope items,
     skip rendering rather than showing an empty bar. The TopBar's
     Edit Dashboard button still gives them a way to set scope. */
  if (parts.length === 0) return null

  /* In the expanded view we only render fields that actually have
     selections — empty categories would just be visual noise. */
  const fieldsWithItems = SCOPE_FIELDS.filter((f) => (scope?.[f.key] || []).length > 0)

  return (
    <section className="scope-summary" aria-label="Dashboard scope">
      <div className="scope-summary-header">
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
                      <span key={item} className="scope-summary-chip">
                        {item}
                      </span>
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
