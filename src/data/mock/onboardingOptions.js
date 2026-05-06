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
   line shown beneath the value in the Add dropdown. Fields where a
   count is meaningless (Term, Instructors) omit `meta`. */
export const SCOPE_OPTIONS = {
  subAccounts: [
    { value: 'College of Business', meta: '142 courses' },
    { value: 'College of Science', meta: '218 courses' },
    { value: 'College of Arts', meta: '96 courses' },
    { value: 'College of Engineering', meta: '165 courses' },
    { value: 'College of Medicine', meta: '84 courses' },
    { value: 'College of Education', meta: '73 courses' },
    { value: 'College of Law', meta: '41 courses' },
  ],
  term: [
    { value: 'Spring 2026' },
    { value: 'Fall 2025' },
    { value: 'Summer 2025' },
    { value: 'Spring 2025' },
    { value: 'All active terms' },
  ],
  studentGroups: [
    { value: 'Students on Probation', meta: '523 students' },
    { value: 'Undecided/Exploratory Students', meta: '1,142 students' },
    { value: 'International Students', meta: '2,418 students' },
    { value: 'Student Athletes', meta: '456 students' },
    { value: 'Biology Majors', meta: '3,275 students' },
    { value: 'First-generation Students', meta: '1,890 students' },
    { value: 'Transfer Students', meta: '624 students' },
    { value: 'Honors Program', meta: '312 students' },
    { value: 'Veterans', meta: '187 students' },
    { value: 'Online-only Students', meta: '1,533 students' },
    { value: 'Graduating Seniors', meta: '2,068 students' },
  ],
  courses: [
    { value: 'BIO 101 — Intro to Biology', meta: '142 students' },
    { value: 'CS 201 — Data Structures', meta: '88 students' },
    { value: 'ENG 110 — Composition', meta: '245 students' },
    { value: 'HIST 220 — World History', meta: '96 students' },
    { value: 'MATH 150 — Calculus I', meta: '312 students' },
    { value: 'PSY 105 — Intro to Psychology', meta: '410 students' },
  ],
  courseGroups: [
    { value: 'Independent Study', meta: '18 courses' },
    { value: 'Pre-Registration Eligible', meta: '124 courses' },
    { value: 'South Campus', meta: '64 courses' },
    { value: 'Cross-Listed Courses', meta: '32 courses' },
    { value: 'Capstone Courses', meta: '22 courses' },
    { value: 'General Education Core', meta: '41 courses' },
    { value: 'STEM Pathway', meta: '88 courses' },
    { value: 'Honors Sections', meta: '19 courses' },
    { value: 'Hybrid-Format Courses', meta: '56 courses' },
    { value: 'Lab-Based Courses', meta: '47 courses' },
  ],
  instructors: [
    { value: 'Dr. Alicia Moreno' },
    { value: 'Prof. Benjamin Clark' },
    { value: 'Dr. Chen Wei' },
    { value: 'Prof. Dana Okafor' },
    { value: 'Dr. Elias Fischer' },
  ],
  modality: [
    { value: 'In-person' },
    { value: 'Online — asynchronous' },
    { value: 'Online — synchronous' },
    { value: 'Hybrid' },
  ],
}

/* Order here drives the order rendered on the scope step.
   `description` shows in the info popover next to each label. Keep the
   ending "Select one or more to..." consistent so popovers feel
   parallel as the user scans through them. The verbs vary slightly
   ("limit", "filter", "narrow", "focus") to keep the copy from feeling
   templated when you read it back-to-back. */
export const SCOPE_FIELDS = [
  {
    key: 'subAccounts',
    label: 'Sub Accounts',
    description:
      'Divisions or colleges within your institution, like College of Business or College of Arts. Select one or more to limit your dashboard to those areas.',
  },
  {
    key: 'term',
    label: 'Term',
    description:
      "The academic term or semester you want to focus on. Select one or more to filter your dashboard's data to that time period.",
  },
  {
    key: 'studentGroups',
    label: 'Student Groups',
    description:
      'Groups of students your institution has defined, like first-gen students or student athletes. Select one or more to focus your dashboard on those students.',
  },
  {
    key: 'courses',
    label: 'Courses',
    description:
      'Individual courses offered at your institution. Select one or more to narrow your dashboard to activity within those courses.',
  },
  {
    key: 'courseGroups',
    label: 'Course Groups',
    description:
      'Groups of courses your institution has defined, like independent study or South Campus courses. Select one or more to focus your dashboard on those courses.',
  },
  {
    key: 'instructors',
    label: 'Instructors',
    description:
      'The instructors teaching at your institution. Select one or more to focus your dashboard on activity within their courses.',
  },
  {
    key: 'modality',
    label: 'Modality',
    description:
      'How a course is delivered — in person, online, or hybrid. Select one or more to focus your dashboard on those formats.',
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
    term: ['Spring 2026'],
    studentGroups: ['First-generation Students', 'Transfer Students'],
    courses: [],
    courseGroups: ['Cross-Listed Courses'],
    instructors: [],
    modality: [],
  },
}
