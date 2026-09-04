import {
  SUB_ACCOUNT_NAMES,
  COHORT_NAMES,
  TAG_NAMES,
  COURSE_GROUP_NAMES,
  INSTRUCTOR_NAMES,
  NAMED_COURSE_NAMES,
} from './scopeGraph.js'

export const FOCUS_AREAS = [
  {
    id: 'institution',
    label: 'Institution Health',
    description:
      'See engagement and activity signals across your entire institution — enrollment trends, login rates, and sub-account health.',
  },
  {
    id: 'course',
    label: 'Course health',
    description:
      'Track course publishing status, pacing, and instructor activity so nothing falls behind before or during a term.',
  },
  {
    id: 'student',
    label: 'Student success & outcomes',
    description:
      'Understand how students are performing across programs with grade distributions, completion rates, and outcome trends.',
  },
]

/* Each option is { value, meta } where `value` is what gets stored in
   the scope (and shown on the chip) and `meta` is a small description
   line shown beneath the value in the Add dropdown.

   Live fields (subAccounts, courseGroups, cohorts, tags, instructors,
   courses) intentionally have NO static `meta` here — their counts are
   computed live against the current selection by scopeGraph.js, since
   they narrow each other's counts as facets are added, in any order.
   Only their value lists (which options exist) live here; those lists
   come straight from scopeGraph.js so there's one source of truth for
   "what values exist" and it can't drift from what the graph computes
   counts against. Term and Modality are unchanged — no live count, so
   they keep plain value-only entries same as before. */
export const SCOPE_OPTIONS = {
  subAccounts: SUB_ACCOUNT_NAMES.map((value) => ({ value })),
  courseGroups: COURSE_GROUP_NAMES.map((value) => ({ value })),
  term: [
    { value: 'Spring 2026' },
    { value: 'Fall 2025' },
    { value: 'Summer 2025' },
    { value: 'Spring 2025' },
    { value: 'All active terms' },
  ],
  cohorts: COHORT_NAMES.map((value) => ({ value })),
  tags: TAG_NAMES.map((value) => ({ value })),
  modality: [
    { value: 'In-person' },
    { value: 'Online — asynchronous' },
    { value: 'Online — synchronous' },
    { value: 'Hybrid' },
  ],
  instructors: INSTRUCTOR_NAMES.map((value) => ({ value })),
  courses: NAMED_COURSE_NAMES.map((value) => ({ value })),
}

/* Order here drives the order rendered on the scope step and in Edit
   your scope. `description` shows in the info popover next to each
   label. Keep the ending "Select one or more to..." consistent so
   popovers feel parallel as the user scans through them. */
export const SCOPE_FIELDS = [
  {
    key: 'subAccounts',
    label: 'Sub Accounts',
    description:
      'Divisions or colleges within your institution, like College of Business or College of Arts. Select one or more to limit your dashboard to those areas. Narrows, and is narrowed by, Cohorts, Tags, and Course Groups.',
  },
  {
    key: 'courseGroups',
    label: 'Course Groups',
    description:
      'Institution-wide course metadata your institution has defined, like Independent Study or South Campus — the course-side equivalent of a Tag. Select one or more to focus your dashboard on those courses. Narrows, and is narrowed by, Sub Accounts, Cohorts, and Tags.',
  },
  {
    key: 'term',
    label: 'Term',
    description:
      "The academic term or semester you want to focus on. Select one or more to filter your dashboard's data to that time period.",
  },
  {
    key: 'cohorts',
    label: 'Cohorts',
    description:
      'People-level groups your institution has defined, like First-Year Students or Student Athletes — independent of sub-account or course boundaries. Select one or more to focus your dashboard on those students. Narrows, and is narrowed by, Sub Accounts, Tags, and Course Groups.',
  },
  {
    key: 'tags',
    label: 'Tags',
    description:
      'Institution-wide metadata attached to a person, like Female or Pell Grant Recipient. Not owned by any cohort — one global definition used everywhere it appears. Select one or more to focus your dashboard on those students. Narrows, and is narrowed by, Sub Accounts, Cohorts, and Course Groups.',
  },
  {
    key: 'modality',
    label: 'Modality',
    description:
      'How a course is delivered — in person, online, or hybrid. Select one or more to focus your dashboard on those formats.',
  },
  {
    key: 'instructors',
    label: 'Instructors',
    description:
      'The instructors teaching at your institution. Select one or more to focus your dashboard on activity within their courses. Narrows, and is narrowed by, Sub Accounts, Cohorts, Tags, and Course Groups.',
  },
  {
    key: 'courses',
    label: 'Courses',
    description:
      'Individual courses offered at your institution. Select one or more to narrow your dashboard to activity within those courses. Narrows, and is narrowed by, Sub Accounts, Cohorts, Tags, and Course Groups.',
  },
]

/* Values Canvas pre-fills when the user chooses "Let Canvas Decide".
   The onboarding flow tracks these separately from user-added values so
   the UI can mark suggested chips differently. Every key in SCOPE_OPTIONS
   should appear here (use [] for fields with no default suggestion). */
export const AUTO_RECOMMENDATIONS = {
  focusAreas: ['institution', 'course'],
  scope: {
    subAccounts: ['College of Business', 'College of Science', 'College of Arts'],
    courseGroups: ['Cross-Listed Courses'],
    term: ['Spring 2026'],
    cohorts: ['First-generation Students', 'Transfer Students'],
    tags: [],
    modality: [],
    instructors: [],
    courses: [],
  },
}
