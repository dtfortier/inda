import { useState, useEffect, useRef } from 'react'
import Dashboard from './Dashboard.jsx'
import { FOCUS_AREAS, SCOPE_FIELDS, SCOPE_OPTIONS, AUTO_RECOMMENDATIONS } from '../data/mock/onboardingOptions.js'
import './Onboarding.css'

/* Auto mode inserts an "analyzing" step (process + loading animation)
   before the "focus" step which shows the results. Analyzing auto-
   advances when the animation finishes. */
const AUTO_FLOW = ['intro', 'analyzing', 'focus', 'scope', 'review']
const MANUAL_FLOW = ['intro', 'focus', 'scope', 'review']
const flowForMode = (mode) => (mode === 'auto' ? AUTO_FLOW : MANUAL_FLOW)

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg className="summary-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" rx="0.5" />
      <rect x="12" y="8" width="3" height="10" rx="0.5" />
      <rect x="17" y="4" width="3" height="14" rx="0.5" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="onboarding-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

/* ───────── STEP 1 ───────── */
function StepIntro({ mode, setMode, stepNumber, stepCount }) {
  const options = [
    {
      id: 'manual',
      title: 'Choose Manually',
      desc: 'Select your own focus areas from a list — institution health, course health, student success, compliance, and more.',
    },
    {
      id: 'auto',
      title: 'Let Canvas Decide',
      desc: 'Canvas will recommend a setup based on your role, permissions, and how you typically use Canvas.',
    },
  ]
  return (
    <>
      <div className="onboarding-eyebrow">Step {stepNumber} of {stepCount}</div>
      <h2 className="onboarding-title">Setup your Insights Dashboard</h2>
      <p className="onboarding-subtitle">
        Tell Canvas what you want to accomplish, choose your own focus areas, or let Canvas configure your dashboard based on your profile.
      </p>
      {options.map((o) => {
        const selected = mode === o.id
        return (
          <button
            key={o.id}
            type="button"
            className={`onboarding-option${selected ? ' selected' : ''}`}
            onClick={() => setMode(o.id)}
          >
            <span className="onboarding-option-indicator radio" />
            <span className="onboarding-option-body">
              <div className="onboarding-option-title">{o.title}</div>
              <div className="onboarding-option-desc">{o.desc}</div>
            </span>
          </button>
        )
      })}
    </>
  )
}

/* ───────── ANALYZING (auto flow only) ───────── */
function Spinner() {
  return (
    <svg className="analyzing-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const ANALYZING_ITEMS = [
  'Your role and permissions',
  'Canvas usage patterns',
  'Sub account structure',
  'Term activity history',
]

function StepAnalyzing({ onDone, stepNumber, stepCount }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= ANALYZING_ITEMS.length) {
      /* Brief pause on the last checkmark before auto-advancing. */
      const done = setTimeout(onDone, 500)
      return () => clearTimeout(done)
    }
    const id = setTimeout(() => setIndex((n) => n + 1), 900)
    return () => clearTimeout(id)
  }, [index, onDone])

  return (
    <>
      <div className="onboarding-eyebrow">Step {stepNumber} of {stepCount}</div>
      <h2 className="onboarding-title">Analyzing your Canvas profile</h2>
      <p className="onboarding-subtitle">This will only take a moment.</p>
      {ANALYZING_ITEMS.map((label, i) => {
        if (i > index) return null
        const isDone = i < index
        const isActive = i === index
        const state = isDone ? 'done' : 'loading'
        return (
          <div key={i} className={`onboarding-option readonly analyzing-row ${state}`} role="presentation">
            <span className="onboarding-option-body">
              <div className="onboarding-option-title">{label}</div>
            </span>
            <span className="analyzing-status" aria-hidden="true">
              {isDone ? <CheckIcon /> : isActive ? <Spinner /> : null}
            </span>
          </div>
        )
      })}
    </>
  )
}

/* ───────── FOCUS ───────── */
function FocusOption({ area, selected, toggleFocus, revealDelay }) {
  return (
    <button
      type="button"
      className={`onboarding-option focus-reveal${selected ? ' selected' : ''}`}
      style={{ '--reveal-delay': `${revealDelay}ms` }}
      onClick={() => toggleFocus(area.id)}
    >
      <span className="onboarding-option-indicator">
        {selected && <CheckIcon />}
      </span>
      <span className="onboarding-option-body">
        <div className="onboarding-option-title">{area.label}</div>
        <div className="onboarding-option-desc">{area.description}</div>
      </span>
    </button>
  )
}

function StepFocus({ focusAreas, toggleFocus, mode, stepNumber, stepCount }) {
  const isAuto = mode === 'auto'
  /* In auto mode the eyebrow/title/subtitle are visually unchanged from
     the analyzing step (same Step 2 of 4), so we don't re-animate them. */
  const headerRevealClass = isAuto ? '' : ' focus-reveal'

  /* In auto mode, split the catalog by selection state: selected areas
     appear up top, unselected ones are hidden behind a disclosure. */
  const recommended = isAuto
    ? FOCUS_AREAS.filter((a) => focusAreas.includes(a.id))
    : FOCUS_AREAS
  const additional = isAuto
    ? FOCUS_AREAS.filter((a) => !focusAreas.includes(a.id))
    : []
  const [showAdditional, setShowAdditional] = useState(false)

  return (
    <>
      <div className={`onboarding-eyebrow${headerRevealClass}`} style={{ '--reveal-delay': '0ms' }}>
        Step {stepNumber} of {stepCount}
      </div>
      <h2 className={`onboarding-title${headerRevealClass}`} style={{ '--reveal-delay': '60ms' }}>
        {isAuto ? "Here's what Canvas recommends" : 'Choose your focus area'}
      </h2>
      <p className={`onboarding-subtitle${headerRevealClass}`} style={{ '--reveal-delay': '120ms' }}>
        {isAuto
          ? 'Based on your role and usage, we suggest starting with these focus areas. You can adjust before continuing.'
          : 'What do you want to track?'}
      </p>

      {isAuto && (
        <div className="onboarding-info-banner focus-reveal" style={{ '--reveal-delay': '180ms' }}>
          <InfoIcon />
          <span>Recommended for Dean/Sub Account Admin based on your Spring 2026 activity and 3 managed sub accounts.</span>
        </div>
      )}

      {recommended.map((area, i) => (
        <FocusOption
          key={area.id}
          area={area}
          selected={focusAreas.includes(area.id)}
          toggleFocus={toggleFocus}
          revealDelay={(isAuto ? 260 : 200) + i * 120}
        />
      ))}

      {isAuto && additional.length > 0 && (
        <div
          className={`focus-additional-row focus-reveal`}
          style={{ '--reveal-delay': `${260 + recommended.length * 120}ms` }}
        >
          <span className="focus-additional-prompt">Want to add more?</span>
          <button
            type="button"
            className="focus-additional-toggle"
            onClick={() => setShowAdditional((v) => !v)}
            aria-expanded={showAdditional}
          >
            {showAdditional ? 'Hide additional options' : 'Show all focus areas'}
          </button>
        </div>
      )}

      {isAuto && showAdditional && additional.map((area, i) => (
        <FocusOption
          key={area.id}
          area={area}
          selected={focusAreas.includes(area.id)}
          toggleFocus={toggleFocus}
          revealDelay={i * 90}
        />
      ))}
    </>
  )
}

/* ───────── STEP 3 ───────── */
function ScopePicker({ field, selected, suggestedValues = [], onAdd, onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const all = SCOPE_OPTIONS[field.key]
  const available = all.filter((o) => !selected.includes(o))

  return (
    <div className="scope-field">
      <div className="scope-field-label">{field.label}</div>
      <div className="scope-chips">
        {selected.map((value) => (
          <span key={value} className={`scope-chip${suggestedValues.includes(value) ? ' suggested' : ' added'}`}>
            {value}
            <button
              type="button"
              className="scope-chip-remove"
              aria-label={`Remove ${value}`}
              onClick={() => onRemove(field.key, value)}
            >
              <XIcon />
            </button>
          </span>
        ))}
        <div className="scope-popover" ref={ref}>
          <button type="button" className="scope-add" onClick={() => setOpen((v) => !v)}>
            <PlusIcon />
            Add
          </button>
          {open && (
            <div className="scope-popover-menu">
              {available.length === 0 ? (
                <div className="scope-popover-empty">All options added</div>
              ) : (
                available.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="scope-popover-item"
                    onClick={() => {
                      onAdd(field.key, option)
                      setOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepScope({ scope, setScope, suggestedScope, mode, stepNumber, stepCount }) {
  const addValue = (key, value) =>
    setScope((prev) => ({ ...prev, [key]: [...(prev[key] || []), value] }))
  const removeValue = (key, value) =>
    setScope((prev) => ({ ...prev, [key]: (prev[key] || []).filter((v) => v !== value) }))

  const isAuto = mode === 'auto'

  return (
    <>
      <div className="onboarding-eyebrow">Step {stepNumber} of {stepCount}</div>
      <h2 className="onboarding-title">{isAuto ? 'Confirm your scope' : 'Set your global scope'}</h2>
      <p className="onboarding-subtitle">
        {isAuto
          ? "Canvas pre-filled this based on your profile. Remove anything that doesn't apply, or add more."
          : "Define your dashboard's scope. This applies to your entire dashboard."}
      </p>
      {isAuto && (
        <div className="scope-legend">
          <span className="scope-legend-item suggested"><span className="scope-legend-dot" /> Suggested by Canvas</span>
          <span className="scope-legend-item added"><span className="scope-legend-dot" /> Added manually</span>
        </div>
      )}
      {SCOPE_FIELDS.map((field) => (
        <ScopePicker
          key={field.key}
          field={field}
          selected={scope[field.key] || []}
          suggestedValues={suggestedScope?.[field.key] || []}
          onAdd={addValue}
          onRemove={removeValue}
        />
      ))}
    </>
  )
}

/* ───────── REVIEW ───────── */
function StepReview({ focusAreas, scope, stepNumber, stepCount }) {
  const focusLabels =
    focusAreas.length === 0
      ? 'No focus areas selected'
      : FOCUS_AREAS.filter((f) => focusAreas.includes(f.id))
          .map((f) => f.label)
          .join(' · ')

  const scopeSummary = SCOPE_FIELDS.flatMap((f) => {
    const values = scope[f.key] || []
    return values.length ? [`${f.label}: ${values.join(', ')}`] : []
  })

  return (
    <>
      <div className="onboarding-eyebrow">Step {stepNumber} of {stepCount}</div>
      <h2 className="onboarding-title">Your dashboard is ready!</h2>
      <p className="onboarding-subtitle">
        Here's what Canvas built for you. You can customize tiles and layout at any time.
      </p>
      <div className="summary-bar">
        <AnalyticsIcon />
        <div>
          <div className="summary-bar-label">Focus areas</div>
          <div className="summary-bar-value">{focusLabels}</div>
        </div>
      </div>
      <div className="summary-bar">
        <AnalyticsIcon />
        <div>
          <div className="summary-bar-label">Scope</div>
          <div className="summary-bar-value">
            {scopeSummary.length ? scopeSummary.join(' · ') : 'No scope defined'}
          </div>
        </div>
      </div>
    </>
  )
}

/* ───────── MAIN ───────── */
export default function Onboarding({ onComplete, initialConfig }) {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState(initialConfig?.mode || 'manual')
  const [focusAreas, setFocusAreas] = useState(initialConfig?.focusAreas || [])
  const [scope, setScope] = useState(
    initialConfig?.scope || {
      subAccounts: [],
      term: [],
      studentGroups: [],
      courses: [],
      courseGroups: [],
      instructors: [],
      modality: [],
    }
  )
  /* Tracks which scope values were pre-filled by Canvas (auto mode) so
     chips can be visually distinguished from user-added ones. When a
     saved auto config is re-loaded, seed this from AUTO_RECOMMENDATIONS
     so previously-suggested chips keep their "suggested" styling. */
  const [suggestedScope, setSuggestedScope] = useState(() =>
    initialConfig?.mode === 'auto'
      ? {
          subAccounts: [...AUTO_RECOMMENDATIONS.scope.subAccounts],
          term: [...AUTO_RECOMMENDATIONS.scope.term],
          studentGroups: [...AUTO_RECOMMENDATIONS.scope.studentGroups],
          courses: [...AUTO_RECOMMENDATIONS.scope.courses],
          courseGroups: [...AUTO_RECOMMENDATIONS.scope.courseGroups],
          instructors: [...AUTO_RECOMMENDATIONS.scope.instructors],
          modality: [...AUTO_RECOMMENDATIONS.scope.modality],
        }
      : {}
  )

  const toggleFocus = (id) =>
    setFocusAreas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  /* Pre-populate focus areas + scope with Canvas recommendations after
     the analyzing animation on step 2 completes. Only runs if the user
     hasn't already customized them. */
  const applyAutoRecommendations = () => {
    if (mode !== 'auto') return
    if (focusAreas.length === 0) setFocusAreas([...AUTO_RECOMMENDATIONS.focusAreas])
    const scopeEmpty = Object.values(scope).every((v) => !v || v.length === 0)
    if (scopeEmpty) {
      setScope({
        subAccounts: [...AUTO_RECOMMENDATIONS.scope.subAccounts],
        term: [...AUTO_RECOMMENDATIONS.scope.term],
        studentGroups: [...AUTO_RECOMMENDATIONS.scope.studentGroups],
        courses: [...AUTO_RECOMMENDATIONS.scope.courses],
        courseGroups: [...AUTO_RECOMMENDATIONS.scope.courseGroups],
        instructors: [...AUTO_RECOMMENDATIONS.scope.instructors],
        modality: [...AUTO_RECOMMENDATIONS.scope.modality],
      })
      setSuggestedScope({
        subAccounts: [...AUTO_RECOMMENDATIONS.scope.subAccounts],
        term: [...AUTO_RECOMMENDATIONS.scope.term],
        studentGroups: [...AUTO_RECOMMENDATIONS.scope.studentGroups],
        courses: [...AUTO_RECOMMENDATIONS.scope.courses],
        courseGroups: [...AUTO_RECOMMENDATIONS.scope.courseGroups],
        instructors: [...AUTO_RECOMMENDATIONS.scope.instructors],
        modality: [...AUTO_RECOMMENDATIONS.scope.modality],
      })
    }
  }

  const flow = flowForMode(mode)
  const stepCount = flow.length
  const currentKey = flow[step - 1] || flow[flow.length - 1]
  const isLastStep = step === stepCount

  /* The analyzing animation and the focus recommendations are presented
     as a single logical step (step 2). Map internal flow positions to
     the displayed numbering so eyebrows + progress bar agree. */
  const DISPLAY_TOTAL = 4
  const displayNumber = (() => {
    if (mode !== 'auto') return step
    // auto flow: intro=1, analyzing=2, focus=2, scope=3, review=4
    const map = { intro: 1, analyzing: 2, focus: 2, scope: 3, review: 4 }
    return map[currentKey] ?? step
  })()

  const canContinue =
    (currentKey === 'intro' && !!mode) ||
    (currentKey === 'focus' && focusAreas.length > 0) ||
    currentKey === 'scope' ||
    currentKey === 'review'

  const primaryLabel =
    currentKey === 'scope' ? 'Preview Dashboard' :
    currentKey === 'review' ? 'Save dashboard' :
    'Continue'

  const handlePrimary = () => {
    if (!isLastStep) {
      setStep(step + 1)
    } else {
      onComplete({ mode, focusAreas, scope })
    }
  }

  /* Clamp step when flow length changes (e.g. mode switched). */
  useEffect(() => {
    if (step > flow.length) setStep(flow.length)
  }, [flow, step])

  /* When the analyzing step completes, apply recommendations and
     auto-advance to the next step (focus recommendations). */
  const handleAnalyzingDone = () => {
    applyAutoRecommendations()
    setStep((s) => Math.min(s + 1, flow.length))
  }

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  return (
    <div className="onboarding-frame">
      <div className="onboarding-card onboarding-card-wizard">
        <div className="onboarding-progress">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${(displayNumber / DISPLAY_TOTAL) * 100}%` }}
          />
        </div>
        <div className="onboarding-card-body">
          {currentKey === 'intro' && (
            <StepIntro
              mode={mode}
              setMode={(next) => {
                setMode(next)
                /* Wipe downstream state so each mode starts clean. Auto
                   gets repopulated by applyAutoRecommendations after the
                   analyzing step, and the scope-empty check there relies
                   on this reset. */
                setFocusAreas([])
                setScope({
                  subAccounts: [],
                  term: [],
                  studentGroups: [],
                  courses: [],
                  courseGroups: [],
                  instructors: [],
                  modality: [],
                })
                setSuggestedScope({})
              }}
              stepNumber={displayNumber}
              stepCount={DISPLAY_TOTAL}
            />
          )}
          {currentKey === 'analyzing' && <StepAnalyzing onDone={handleAnalyzingDone} stepNumber={displayNumber} stepCount={DISPLAY_TOTAL} />}
          {currentKey === 'focus' && <StepFocus focusAreas={focusAreas} toggleFocus={toggleFocus} mode={mode} stepNumber={displayNumber} stepCount={DISPLAY_TOTAL} />}
          {currentKey === 'scope' && <StepScope scope={scope} setScope={setScope} suggestedScope={suggestedScope} mode={mode} stepNumber={displayNumber} stepCount={DISPLAY_TOTAL} />}
          {currentKey === 'review' && <StepReview focusAreas={focusAreas} scope={scope} stepNumber={displayNumber} stepCount={DISPLAY_TOTAL} />}
        </div>
        <div className="onboarding-footer">
          {step > 1 ? (
            <button type="button" className="onboarding-btn secondary" onClick={handleBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="onboarding-footer-right">
            {currentKey !== 'analyzing' && (
              <button
                type="button"
                className="onboarding-btn primary"
                onClick={handlePrimary}
                disabled={!canContinue}
              >
                {primaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      {currentKey === 'review' && (
        <div className="onboarding-preview" aria-hidden="true">
          <div className="onboarding-preview-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview — drag widgets to rearrange after saving
          </div>
          <Dashboard />
        </div>
      )}
    </div>
  )
}
