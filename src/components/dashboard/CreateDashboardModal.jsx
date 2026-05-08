import { useState, useRef, useEffect } from 'react'
import './CreateDashboardModal.css'

/* ── Mock data ─────────────────────────────────────────────── */

const MYSELF = {
  id: 'myself',
  label: 'Myself',
  role: 'Administrator',
  access: 'Full access · All permissions',
  permissions: {
    subAccounts:   { count: 5,  total: 5,  label: '5 of 5' },
    term:          { count: 3,  total: 3,  label: '3 of 3' },
    studentGroups: { count: 12, total: 12, label: '12 of 12' },
    courses:       { count: null, label: 'All' },
    courseGroups:  { count: null, label: 'All' },
    instructors:   { count: null, label: 'All' },
    modality:      { count: null, label: 'All' },
  },
}

const OTHER_USERS = [
  {
    id: 'sarah',
    label: 'Sarah Johnson',
    role: 'Advisor · College of Science',
    access: 'Limited access',
    permissions: {
      subAccounts:   { count: 1, total: 5,  label: '1 of 5' },
      term:          { count: 1, total: 3,  label: '1 of 3' },
      studentGroups: { count: 3, total: 12, label: '3 of 12' },
      courses:       { count: null, label: 'Limited' },
      courseGroups:  { count: null, label: 'Limited' },
      instructors:   { count: null, label: 'None' },
      modality:      { count: null, label: 'All' },
    },
  },
  {
    id: 'marcus',
    label: 'Marcus Webb',
    role: 'Dean · College of Business',
    access: 'Partial access',
    permissions: {
      subAccounts:   { count: 2, total: 5,  label: '2 of 5' },
      term:          { count: 3, total: 3,  label: '3 of 3' },
      studentGroups: { count: 8, total: 12, label: '8 of 12' },
      courses:       { count: null, label: 'All' },
      courseGroups:  { count: null, label: 'Limited' },
      instructors:   { count: null, label: 'All' },
      modality:      { count: null, label: 'All' },
    },
  },
  {
    id: 'priya',
    label: 'Priya Nair',
    role: 'Faculty · Department of Biology',
    access: 'Limited access',
    permissions: {
      subAccounts:   { count: 1, total: 5,  label: '1 of 5' },
      term:          { count: 2, total: 3,  label: '2 of 3' },
      studentGroups: { count: 2, total: 12, label: '2 of 12' },
      courses:       { count: null, label: 'Limited' },
      courseGroups:  { count: null, label: 'None' },
      instructors:   { count: null, label: 'None' },
      modality:      { count: null, label: 'Limited' },
    },
  },
]

/* The labels here drive the display in the Audience Preview panel —
   "Terms" / "Modalities" plurals read fine for category headers. The
   keys match the rest of the app (singular term / modality). */
const PERMISSION_ROWS = [
  { key: 'subAccounts',   label: 'Sub accounts' },
  { key: 'term',          label: 'Terms' },
  { key: 'studentGroups', label: 'Student groups' },
  { key: 'courses',       label: 'Courses' },
  { key: 'courseGroups',  label: 'Course groups' },
  { key: 'instructors',   label: 'Instructors' },
  { key: 'modality',      label: 'Modalities' },
]

const DEFAULT_WIDGETS = [
  'Institution Snapshot',
  'Student Overview',
  'Course Activity Rate',
  'Sub-Account Health',
  'Enrollment Trend',
]

const ALL_OPTIONS = {
  subAccounts:   [
    { value: 'College of Business',   meta: '142 courses' },
    { value: 'College of Science',    meta: '98 courses' },
    { value: 'College of Arts',       meta: '74 courses' },
    { value: 'College of Education',  meta: '55 courses' },
    { value: 'School of Engineering', meta: '120 courses' },
  ],
  term:          [
    { value: 'Spring 2025' },
    { value: 'Fall 2024' },
    { value: 'Winter 2025' },
  ],
  studentGroups: [
    { value: 'First-generation Students', meta: '892 students' },
    { value: 'Transfer Students',         meta: '341 students' },
    { value: 'Student Athletes',          meta: '215 students' },
    { value: 'Students on Probation',     meta: '128 students' },
    { value: 'International Students',    meta: '476 students' },
    { value: 'Biology Majors',            meta: '203 students' },
    { value: 'Undecided/Exploratory',     meta: '312 students' },
    { value: 'Honor Students',            meta: '189 students' },
  ],
  courses:       [
    { value: 'BIO 101',  meta: '28 students' },
    { value: 'CHEM 201', meta: '22 students' },
    { value: 'ENG 110',  meta: '35 students' },
    { value: 'MATH 150', meta: '30 students' },
  ],
  courseGroups:  [
    { value: 'Independent Study',         meta: '12 courses' },
    { value: 'Pre-Registration Eligible', meta: '45 courses' },
    { value: 'South Campus',              meta: '28 courses' },
    { value: 'Cross-Listed Courses',      meta: '19 courses' },
  ],
  instructors:   [
    { value: 'Dr. Emily Carter' },
    { value: 'Prof. James Liu' },
    { value: 'Dr. Maria Santos' },
    { value: 'Dr. Kevin Osei' },
  ],
  modality:      [
    { value: 'In-Person' },
    { value: 'Online' },
    { value: 'Hybrid' },
  ],
}

function getPermittedOptions(key, audiencePerms) {
  const perm = audiencePerms[key]
  if (!perm) return ALL_OPTIONS[key] || []
  if (perm.label === 'None') return []
  if (perm.label === 'Limited') return (ALL_OPTIONS[key] || []).slice(0, 2)
  if (perm.count !== null) return (ALL_OPTIONS[key] || []).slice(0, perm.count)
  return ALL_OPTIONS[key] || []
}

/* ── Icons ─────────────────────────────────────────────────── */

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const GridWidgetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const STEPS = [
  { num: 1, label: 'Dashboard details' },
  { num: 2, label: 'Define scope' },
  { num: 3, label: 'Review & create' },
]

/* ── Audience preview panel ────────────────────────────────── */

function AudiencePreview({ audience }) {
  const perms = audience.permissions
  const isSelf = audience.id === 'myself'
  const initials = isSelf ? 'You' : audience.label.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <div className="cdm-audience">
      <div className="cdm-audience-heading">
        <span className="cdm-audience-icon"><UserIcon /></span>
        Audience preview
      </div>
      <p className="cdm-audience-sub">This dashboard will be created for:</p>
      <div className="cdm-audience-card">
        <div className="cdm-audience-avatar">{initials}</div>
        <div className="cdm-audience-info">
          <div className="cdm-audience-name">{isSelf ? 'You (Myself)' : audience.label}</div>
          <div className="cdm-audience-role">{audience.access} · {isSelf ? 'All permissions' : audience.role}</div>
        </div>
      </div>
      <p className="cdm-audience-access-label">
        {isSelf ? 'With full access, you can include:' : 'Available access:'}
      </p>
      <ul className="cdm-audience-perms">
        {PERMISSION_ROWS.map(row => {
          const p = perms[row.key]
          const isNone    = p.label === 'None'
          const isLimited = p.label === 'Limited'
          return (
            <li key={row.key} className={`cdm-audience-perm-row${isNone ? ' cdm-audience-perm-row--none' : ''}`}>
              <span className="cdm-audience-perm-label">{row.label}</span>
              <span className={`cdm-audience-perm-value${isNone ? ' none' : isLimited ? ' limited' : ''}`}>
                {p.label}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="cdm-audience-note">
        <EyeIcon />
        You'll be able to preview the dashboard before it's created.
      </div>
    </div>
  )
}

/* ── Step 1: Dashboard details ─────────────────────────────── */

function StepDetails({ form, onChange, audience, onAudienceChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
    }
    if (dropdownOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const allUsers = [MYSELF, ...OTHER_USERS]
  const isSelf = audience.id === 'myself'

  return (
    <div className="cdm-step-content">
      <h2 className="cdm-step-heading">Dashboard details</h2>

      <div className="cdm-field">
        <label className="cdm-label" htmlFor="db-name">
          Dashboard name <span className="cdm-required">*</span>
        </label>
        <input
          id="db-name"
          className="cdm-input"
          type="text"
          placeholder="e.g. Advisor Student Success Overview"
          value={form.name}
          onChange={e => onChange({ name: e.target.value })}
          maxLength={80}
        />
        <p className="cdm-hint">Choose a clear, descriptive name for this dashboard.</p>
      </div>

      <div className="cdm-field">
        <label className="cdm-label" htmlFor="db-desc">
          Description <span className="cdm-optional">(optional)</span>
        </label>
        <textarea
          id="db-desc"
          className="cdm-textarea"
          rows={3}
          placeholder="Overview of student success metrics for my advisees, including engagement, performance, and risk indicators."
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
        />
      </div>

      <div className="cdm-field">
        <label className="cdm-label">Dashboard for</label>
        <div className="cdm-dropdown-wrap" ref={dropRef}>
          <button
            className="cdm-dropdown-trigger"
            onClick={() => setDropdownOpen(o => !o)}
            type="button"
          >
            <span className="cdm-dropdown-avatar">
              {isSelf ? 'Me' : audience.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
            <span className="cdm-dropdown-label">{isSelf ? 'Myself' : audience.label}</span>
            <span className="cdm-dropdown-chevron"><ChevronIcon /></span>
          </button>
          {dropdownOpen && (
            <div className="cdm-dropdown-menu">
              {allUsers.map(u => (
                <button
                  key={u.id}
                  className={`cdm-dropdown-item${u.id === audience.id ? ' active' : ''}`}
                  onClick={() => { onAudienceChange(u); setDropdownOpen(false) }}
                  type="button"
                >
                  <span className="cdm-dropdown-item-avatar">
                    {u.id === 'myself' ? 'Me' : u.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                  <span className="cdm-dropdown-item-text">
                    <span className="cdm-dropdown-item-name">{u.id === 'myself' ? 'Myself' : u.label}</span>
                    {u.id !== 'myself' && <span className="cdm-dropdown-item-role">{u.role}</span>}
                  </span>
                  {u.id === audience.id && <span className="cdm-dropdown-item-check"><CheckIcon /></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cdm-for-msg cdm-for-msg--blue">
          <InfoIcon />
          <span>
            {isSelf
              ? 'This dashboard will be created for yourself using your current permissions.'
              : `Scope options are filtered based on ${audience.label}'s role and data permissions.`}
          </span>
        </div>

        <div className="cdm-for-msg cdm-for-msg--gray">
          <InfoIcon />
          <span>
            {isSelf
              ? "You'll have full access to all available scope options and data."
              : `You are configuring a dashboard within ${audience.label}'s access level. You cannot expand their permissions.`}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Step 2: Define scope ──────────────────────────────────── */

const SCOPE_FIELDS = [
  { key: 'subAccounts',   label: 'Sub Accounts',   description: 'Divisions or colleges within your institution. Select one or more to limit your dashboard to those areas.' },
  { key: 'term',          label: 'Term',           description: "The academic term or semester you want to focus on. Select one or more to filter your dashboard's data." },
  { key: 'studentGroups', label: 'Student Groups', description: 'Groups of students your institution has defined. Select one or more to focus your dashboard on those students.' },
  { key: 'courses',       label: 'Courses',        description: 'Individual courses offered at your institution. Select one or more to narrow your dashboard.' },
  { key: 'courseGroups',  label: 'Course Groups',  description: 'Groups of courses your institution has defined. Select one or more to focus your dashboard on those courses.' },
  { key: 'instructors',   label: 'Instructors',    description: 'The instructors teaching at your institution. Select one or more to focus on their courses.' },
  { key: 'modality',      label: 'Modality',       description: 'The delivery format of courses. Select one or more to filter by how courses are taught.' },
]

function ScopeField({ fieldDef, selected, onAdd, onRemove, audiencePerms }) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [infoOpen, setInfoOpen]       = useState(false)
  const addRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) setPopoverOpen(false)
    }
    if (popoverOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popoverOpen])

  const permLabel = audiencePerms[fieldDef.key]?.label
  const isNone    = permLabel === 'None'
  const isLimited = permLabel === 'Limited'

  const permittedOptions = getPermittedOptions(fieldDef.key, audiencePerms)
  const available = permittedOptions.filter(o => !selected.includes(o.value))

  return (
    <div className={`cdm-scope-field${isNone ? ' cdm-scope-field--disabled' : ''}`}>
      <div className="cdm-scope-field-header">
        <div className="cdm-scope-field-label">
          {fieldDef.label}
          <div className="cdm-scope-info-wrap">
            <button className="cdm-scope-info-btn" onClick={() => setInfoOpen(o => !o)} aria-label={`Info about ${fieldDef.label}`}>
              <InfoIcon />
            </button>
            {infoOpen && <div className="cdm-scope-info-tooltip">{fieldDef.description}</div>}
          </div>
          {isNone    && <span className="cdm-scope-badge cdm-scope-badge--none">No access</span>}
          {isLimited && <span className="cdm-scope-badge cdm-scope-badge--limited">Limited</span>}
        </div>
        <span className="cdm-scope-count">{selected.length > 0 ? `${selected.length} selected` : ''}</span>
      </div>

      {!isNone && (
        <div className="cdm-scope-chips">
          {selected.map(val => (
            <span key={val} className="cdm-scope-chip">
              <span>{val}</span>
              <button className="cdm-scope-chip-remove" onClick={() => onRemove(fieldDef.key, val)} aria-label={`Remove ${val}`}>
                <CloseIcon />
              </button>
            </span>
          ))}
          <div className="cdm-scope-add-wrap" ref={addRef}>
            <button className="cdm-scope-add-btn" onClick={() => setPopoverOpen(o => !o)} disabled={available.length === 0 && selected.length === permittedOptions.length}>
              + Add
            </button>
            {popoverOpen && (
              <div className="cdm-scope-add-menu">
                {available.length === 0
                  ? <div className="cdm-scope-add-empty">All available options selected</div>
                  : available.map(opt => (
                    <button key={opt.value} className="cdm-scope-add-item" onClick={() => { onAdd(fieldDef.key, opt.value); setPopoverOpen(false) }}>
                      <div className="cdm-scope-add-item-name">{opt.value}</div>
                      {opt.meta && <div className="cdm-scope-add-item-meta">{opt.meta}</div>}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}

      {isNone && (
        <p className="cdm-scope-none-msg">This audience doesn't have access to {fieldDef.label.toLowerCase()} data.</p>
      )}
    </div>
  )
}

function StepScope({ scope, onScopeChange, audience }) {
  const isSelf = audience.id === 'myself'
  const handleAdd    = (key, val) => onScopeChange({ ...scope, [key]: [...(scope[key] || []), val] })
  const handleRemove = (key, val) => onScopeChange({ ...scope, [key]: (scope[key] || []).filter(v => v !== val) })

  return (
    <div className="cdm-step-content">
      <h2 className="cdm-step-heading">Define scope</h2>
      <p className="cdm-step-subtext">
        Select the data this dashboard will include. Filters apply within{' '}
        {isSelf ? 'your' : `${audience.label}'s`} access permissions.
      </p>
      <div className="cdm-scope-fields">
        {SCOPE_FIELDS.map(f => (
          <ScopeField
            key={f.key}
            fieldDef={f}
            selected={scope[f.key] || []}
            onAdd={handleAdd}
            onRemove={handleRemove}
            audiencePerms={audience.permissions}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Step 3: Review & create ───────────────────────────────── */

function StepReview({ form, audience, scope }) {
  const isSelf = audience.id === 'myself'
  const scopeEntries = SCOPE_FIELDS.map(f => ({ label: f.label, values: scope[f.key] || [] })).filter(e => e.values.length > 0)
  const hasLimitedPerms = !isSelf && Object.values(audience.permissions).some(p => p.label === 'None' || p.label === 'Limited')

  return (
    <div className="cdm-step-content">
      <h2 className="cdm-step-heading">Review &amp; create</h2>
      <p className="cdm-step-subtext">Confirm your dashboard settings before creating.</p>

      <div className="cdm-review-card">
        <div className="cdm-review-row">
          <span className="cdm-review-label">Dashboard name</span>
          <span className="cdm-review-value">{form.name || <em className="cdm-review-empty">Untitled</em>}</span>
        </div>
        {form.description && (
          <div className="cdm-review-row">
            <span className="cdm-review-label">Description</span>
            <span className="cdm-review-value">{form.description}</span>
          </div>
        )}
        <div className="cdm-review-row">
          <span className="cdm-review-label">Dashboard for</span>
          <span className="cdm-review-value">
            {isSelf ? 'Myself' : audience.label}
            {!isSelf && <span className="cdm-review-role"> · {audience.role}</span>}
          </span>
        </div>
      </div>

      {hasLimitedPerms && (
        <div className="cdm-review-notice">
          <InfoIcon />
          <span>Some scope categories are unavailable due to {audience.label}'s permission level. The dashboard will only include data within their access.</span>
        </div>
      )}

      <div className="cdm-review-section">
        <div className="cdm-review-section-label">Scope selected</div>
        {scopeEntries.length === 0
          ? <p className="cdm-review-empty-scope">No scope filters applied — the dashboard will show all available data.</p>
          : (
            <div className="cdm-review-scope-grid">
              {scopeEntries.map(e => (
                <div key={e.label} className="cdm-review-scope-entry">
                  <div className="cdm-review-scope-cat">{e.label}</div>
                  <div className="cdm-review-scope-chips">
                    {e.values.map(v => <span key={v} className="cdm-review-chip">{v}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <div className="cdm-review-section">
        <div className="cdm-review-section-label">Widgets included</div>
        <ul className="cdm-review-widgets">
          {DEFAULT_WIDGETS.map(w => (
            <li key={w} className="cdm-review-widget-row">
              <span className="cdm-review-widget-icon"><GridWidgetIcon /></span>
              {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── Footer bar ────────────────────────────────────────────── */

function FooterBar({ step, onBack, onCancel, onSaveExit, onNext, onCreate, canProceed, creating }) {
  return (
    <div className="cdm-bottom-bar">
      <button className="cdm-btn cdm-btn--tertiary" onClick={onCancel}>Cancel</button>
      <div className="cdm-bottom-steps">
        {STEPS.map(s => (
          <span key={s.num} className={`cdm-bottom-step${s.num === step ? ' active' : s.num < step ? ' done' : ''}`} title={s.label}>
            {s.num < step ? <CheckIcon /> : s.num}
            {s.num === step && <span className="cdm-bottom-step-label">{s.label}</span>}
          </span>
        ))}
      </div>
      <div className="cdm-bottom-actions">
        {step > 1 && <button className="cdm-btn cdm-btn--tertiary" onClick={onBack}>Back</button>}
        <button className="cdm-btn cdm-btn--secondary" onClick={onSaveExit}>Save and exit</button>
        {step < 3 ? (
          <button className="cdm-btn cdm-btn--primary" onClick={onNext} disabled={!canProceed}>
            Next: {STEPS[step].label} <ArrowRightIcon />
          </button>
        ) : (
          <button className="cdm-btn cdm-btn--primary" onClick={onCreate} disabled={creating}>
            {creating ? 'Creating…' : 'Create dashboard'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Main modal ────────────────────────────────────────────── */

export default function CreateDashboardModal({ isOpen, onClose, onCreate }) {
  const [step, setStep]         = useState(1)
  const [form, setForm]         = useState({ name: '', description: '' })
  const [audience, setAudience] = useState(MYSELF)
  const [scope, setScope]       = useState({})
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setForm({ name: '', description: '' })
      setAudience(MYSELF)
      setScope({})
      setCreating(false)
    }
  }, [isOpen])

  const handleAudienceChange = (newAudience) => {
    setAudience(newAudience)
    setScope(prev => {
      const next = {}
      Object.keys(prev).forEach(key => {
        const permitted = getPermittedOptions(key, newAudience.permissions).map(o => o.value)
        const filtered  = (prev[key] || []).filter(v => permitted.includes(v))
        if (filtered.length > 0) next[key] = filtered
      })
      return next
    })
  }

  if (!isOpen) return null

  const handleNext     = () => setStep(s => Math.min(s + 1, 3))
  const handleBack     = () => setStep(s => Math.max(s - 1, 1))
  const handleCreate   = () => {
    setCreating(true)
    setTimeout(() => {
      setCreating(false)
      onCreate({ name: form.name || 'New Dashboard', audience, scope })
      onClose()
    }, 800)
  }
  const handleSaveExit = () => {
    onCreate({ name: form.name || 'New Dashboard', audience, scope })
    onClose()
  }

  const canProceed = step === 1 ? form.name.trim().length > 0 : true

  return (
    <div className="cdm-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="cdm-modal" role="dialog" aria-modal="true" aria-label="Create a new dashboard">
        <div className="cdm-header">
          <div className="cdm-header-text">
            <h1 className="cdm-header-title">Create a new dashboard</h1>
            <p className="cdm-header-subtitle">Build a purpose-driven dashboard for the right audience.</p>
          </div>
          <button className="cdm-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className="cdm-body">
          <div className="cdm-content">
            {step === 1 && (
              <StepDetails
                form={form}
                onChange={patch => setForm(prev => ({ ...prev, ...patch }))}
                audience={audience}
                onAudienceChange={handleAudienceChange}
              />
            )}
            {step === 2 && <StepScope scope={scope} onScopeChange={setScope} audience={audience} />}
            {step === 3 && <StepReview form={form} audience={audience} scope={scope} />}
          </div>
          <AudiencePreview audience={audience} />
        </div>

        <FooterBar
          step={step}
          onBack={handleBack}
          onCancel={onClose}
          onSaveExit={handleSaveExit}
          onNext={handleNext}
          onCreate={handleCreate}
          canProceed={canProceed}
          creating={creating}
        />
      </div>
    </div>
  )
}
