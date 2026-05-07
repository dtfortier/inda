import './MetricStatusBadge.css'

/* Inline status pill shown next to / under a metric value when a
   monitoring rule has produced a status for it. Styling is intentionally
   subtle — these should read as informative chrome, not warnings. */

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

const VARIANTS = {
  'on-target':       { label: 'On Target',       tone: 'success-soft', Icon: CheckIcon },
  'goal-met':        { label: 'Goal Met',        tone: 'success',      Icon: CheckIcon },
  'at-risk':         { label: 'At Risk',         tone: 'warning',      Icon: WarningIcon },
  'below-threshold': { label: 'Below Threshold', tone: 'danger',       Icon: WarningIcon },
}

export default function MetricStatusBadge({ status, label }) {
  if (!status) return null
  const variant = VARIANTS[status]
  if (!variant) return null
  const text = label || variant.label
  const Icon = variant.Icon
  return (
    <span className={`metric-status-badge ${variant.tone}`}>
      <Icon />
      <span>{text}</span>
    </span>
  )
}
