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

export const SCOPE_OPTIONS = {
  subAccounts: [
    'College of Business',
    'College of Science',
    'College of Arts',
    'College of Engineering',
    'College of Medicine',
    'College of Education',
    'College of Law',
  ],
  term: ['Spring 2026', 'Fall 2025', 'Summer 2025', 'Spring 2025', 'All active terms'],
  courses: [
    'BIO 101 — Intro to Biology',
    'CS 201 — Data Structures',
    'ENG 110 — Composition',
    'HIST 220 — World History',
    'MATH 150 — Calculus I',
    'PSY 105 — Intro to Psychology',
  ],
  instructors: [
    'Dr. Alicia Moreno',
    'Prof. Benjamin Clark',
    'Dr. Chen Wei',
    'Prof. Dana Okafor',
    'Dr. Elias Fischer',
  ],
  modality: ['In-person', 'Online — asynchronous', 'Online — synchronous', 'Hybrid'],
}

export const SCOPE_FIELDS = [
  { key: 'subAccounts', label: 'Sub Accounts' },
  { key: 'term', label: 'Term' },
  { key: 'courses', label: 'Courses' },
  { key: 'instructors', label: 'Instructors' },
  { key: 'modality', label: 'Modality' },
]

/* Values Canvas pre-fills when the user chooses "Let Canvas Decide".
   The onboarding flow tracks these separately from user-added values so
   the UI can mark suggested chips differently. */
export const AUTO_RECOMMENDATIONS = {
  focusAreas: ['institution', 'course'],
  scope: {
    subAccounts: ['College of Business', 'College of Science', 'College of Arts'],
    term: ['Spring 2026'],
    courses: [],
    instructors: [],
    modality: [],
  },
}
