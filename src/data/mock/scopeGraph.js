/* ── Scope narrowing graph (mock) ───────────────────────────────────────
   Backs the live cross-narrowing behavior for the "scope" facets that
   mutually narrow one another's counts, in any selection order:

     People side:  Cohorts, Tags
     Course side:  Sub Accounts, Course Groups, Instructors, Courses

   Term and Modality are NOT part of this graph — they stay static, per
   spec ("Term, Modality — unchanged").

   The model: a synthetic institution of students and courses, linked by
   enrollment. Students carry Cohort + Tag membership directly. Courses
   carry Sub Account + Course Group + Instructor + (for a handful) a
   real "Course" identity. Because every field's live count is computed
   by walking the *same* enrollment graph, selecting any one facet first
   narrows every other facet's own displayed count — symmetrically,
   regardless of order. A facet never disappears from its list when its
   count hits zero; it just shows 0 (see EditScopeModal/Onboarding).

   Everything below is generated once, deterministically (seeded PRNG),
   when this module is first imported — cheap enough (tens of thousands
   of small objects) to keep every count computation synchronous with no
   loading state, per spec ("keep it instant for the prototype"). */

/* ── seeded PRNG (mulberry32) — deterministic across reloads ─────────── */
function mulberry32(seed) {
  let s = seed
  return function rand() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260904)
const randInt = (max) => Math.floor(rand() * max)
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── source lists ────────────────────────────────────────────────────
   These are the canonical "which values exist" lists for the live
   fields. onboardingOptions.js re-exports these as SCOPE_OPTIONS so the
   rest of the app has a single place to import scope values from. */

export const SUB_ACCOUNT_COURSE_COUNTS = [
  ['College of Business', 142],
  ['College of Science', 218],
  ['College of Arts', 96],
  ['College of Engineering', 165],
  ['College of Medicine', 84],
  ['College of Education', 73],
  ['College of Law', 41],
]
export const SUB_ACCOUNT_NAMES = SUB_ACCOUNT_COURSE_COUNTS.map(([name]) => name)

export const COHORT_MEMBERSHIP_TARGETS = [
  ['Students on Probation', 523],
  ['Undecided/Exploratory Students', 1142],
  ['International Students', 2418],
  ['Student Athletes', 456],
  ['Biology Majors', 3275],
  ['First-generation Students', 1890],
  ['Transfer Students', 624],
  ['Honors Program', 312],
  ['Veterans', 187],
  ['Online-only Students', 1533],
  ['Graduating Seniors', 2068],
]
export const COHORT_NAMES = COHORT_MEMBERSHIP_TARGETS.map(([name]) => name)

/* New — didn't exist under the old model. Institution-wide metadata on
   a person; flat, global, one definition. Probabilities are independent
   (a student can carry any combination). */
export const TAG_MEMBERSHIP_PROBABILITIES = [
  ['Female', 0.48],
  ['Male', 0.47],
  ['Nonbinary', 0.03],
  ['Pell Grant Recipient', 0.34],
  ['Work-Study Employed', 0.19],
  ['Has Accommodation Plan', 0.11],
  ["Dean's List", 0.16],
  ['Academic Warning', 0.07],
  ['Lives On-Campus', 0.38],
  ['Lives Off-Campus', 0.55],
]
export const TAG_NAMES = TAG_MEMBERSHIP_PROBABILITIES.map(([name]) => name)

/* Course Groups — the course-side mirror of Tag. One flat global
   definition, unique by name, lives on courses rather than people. */
export const COURSE_GROUP_MEMBERSHIP_TARGETS = [
  ['Independent Study', 18],
  ['Pre-Registration Eligible', 124],
  ['South Campus', 64],
  ['Cross-Listed Courses', 32],
  ['Capstone Courses', 22],
  ['General Education Core', 41],
  ['STEM Pathway', 88],
  ['Honors Sections', 19],
  ['Hybrid-Format Courses', 56],
  ['Lab-Based Courses', 47],
]
export const COURSE_GROUP_NAMES = COURSE_GROUP_MEMBERSHIP_TARGETS.map(([name]) => name)

export const INSTRUCTOR_NAMES = [
  'Dr. Alicia Moreno',
  'Prof. Benjamin Clark',
  'Dr. Chen Wei',
  'Prof. Dana Okafor',
  'Dr. Elias Fischer',
]

export const NAMED_COURSE_NAMES = [
  'BIO 101 — Intro to Biology',
  'CS 201 — Data Structures',
  'ENG 110 — Composition',
  'HIST 220 — World History',
  'MATH 150 — Calculus I',
  'PSY 105 — Intro to Psychology',
]

/* Total institution size — matches the ~14,200 enrollment figure used
   elsewhere in the prototype's mock widget data, so base ("nothing else
   selected") counts land in a believable range relative to the rest of
   the app. Individual synthetic numbers won't match legacy static meta
   strings exactly (those were hand-authored), but they're generated
   from the same target weights so they land in the same neighborhood. */
const N_STUDENTS = 14200

const FIRST_NAMES = [
  'Ava', 'Jordan', 'Marcus', 'Taylor', 'Riley', 'Casey', 'Morgan', 'Alex',
  'Jamie', 'Drew', 'Sam', 'Robin', 'Cameron', 'Skyler', 'Quinn', 'Reese',
  'Phoenix', 'Sage', 'Avery', 'Logan', 'Hayden', 'Emerson', 'Finley', 'Rowan',
  'Dakota', 'Parker', 'Sawyer', 'River', 'Indigo', 'Wren', 'Ellis', 'Harper',
]
const LAST_NAMES = [
  'Martinez', 'Lee', 'Chen', 'Johnson', 'Patel', 'Wilson', 'Davis', 'Nguyen',
  'Smith', 'Anderson', 'Garcia', 'Brown', 'Rodriguez', 'Park', 'Kim', 'Thompson',
  'Moore', 'Taylor', 'Jackson', 'White', 'Williams', 'Wright', 'Liu', 'Singh',
  'Khan', 'Hernandez', 'Carter', 'Reed', 'Bailey', 'Cooper', 'Murphy', 'Rivera',
]
const COURSE_PREFIXES = [
  'BIO', 'CHEM', 'CS', 'ENG', 'HIST', 'MATH', 'PSY', 'PHYS', 'ART', 'MUS',
  'ECON', 'PHIL', 'SOC', 'POLS', 'COMM', 'ANTH',
]
const COURSE_TITLES = [
  'Intro to Biology', 'Organic Chemistry', 'Data Structures', 'Composition',
  'World History', 'Calculus I', 'Intro to Psychology', 'Mechanics',
  'Drawing', 'Music Theory', 'Microeconomics', 'Ethics', 'Sociology',
  'American Government', 'Public Speaking', 'Cultural Anthropology',
]

/* ── build courses ────────────────────────────────────────────────────
   One course record per sub-account seat, sized to exactly match
   SUB_ACCOUNT_COURSE_COUNTS (so the base, nothing-else-selected count
   for each sub account matches the legacy meta numbers exactly). */
function buildCourses() {
  const courses = []
  let seq = 0
  for (const [subAccount, count] of SUB_ACCOUNT_COURSE_COUNTS) {
    for (let i = 0; i < count; i++) {
      courses.push({
        id: `course-${seq++}`,
        label: null, // set below for the handful of "named" courses
        subAccount,
        instructor: null,
        courseGroups: [],
        enrolledStudentIds: [], // filled in after students are built
      })
    }
  }

  // Course Groups: pick `target` distinct courses per group so the base
  // count matches COURSE_GROUP_MEMBERSHIP_TARGETS exactly.
  for (const [group, target] of COURSE_GROUP_MEMBERSHIP_TARGETS) {
    const pool = shuffle(courses)
    for (let i = 0; i < target && i < pool.length; i++) {
      pool[i].courseGroups.push(group)
    }
  }

  // Instructors: each gets a random, non-overlapping slice of courses.
  {
    const pool = shuffle(courses)
    let idx = 0
    for (const instructor of INSTRUCTOR_NAMES) {
      const n = 15 + randInt(15) // 15–29 courses
      for (let i = 0; i < n && idx < pool.length; i++, idx++) {
        pool[idx].instructor = instructor
      }
    }
  }

  // Named courses: give a handful of course records a real display name
  // so they're selectable as individual "Courses" values.
  {
    const pool = shuffle(courses)
    NAMED_COURSE_NAMES.forEach((name, i) => {
      pool[i].label = name
    })
  }

  // Background (unnamed) courses still need a display name for the
  // inspector's member list — generate one deterministically.
  for (const course of courses) {
    if (course.label) continue
    const hash = hashSeed(course.id)
    const prefix = COURSE_PREFIXES[hash % COURSE_PREFIXES.length]
    const num = 100 + (hash % 400)
    const title = COURSE_TITLES[(hash >>> 3) % COURSE_TITLES.length]
    course.label = `${prefix} ${num} — ${title}`
  }

  return courses
}

function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/* ── build students ──────────────────────────────────────────────────
   Cohort/Tag membership is independent Bernoulli per value, weighted so
   the base institution-wide count lands near the target/probability.
   Each student enrolls in 3–6 random courses, which is what lets Sub
   Account/Course Groups/Instructors/Courses narrow Cohort/Tag counts
   (and vice versa) via the enrollment bridge. */
function buildStudents(courses) {
  const students = []
  for (let i = 0; i < N_STUDENTS; i++) {
    const cohorts = []
    for (const [cohort, target] of COHORT_MEMBERSHIP_TARGETS) {
      if (rand() < target / N_STUDENTS) cohorts.push(cohort)
    }
    const tags = []
    for (const [tag, prob] of TAG_MEMBERSHIP_PROBABILITIES) {
      if (rand() < prob) tags.push(tag)
    }
    const enrollCount = 3 + randInt(4) // 3–6
    const enrolledCourseIds = []
    for (let j = 0; j < enrollCount; j++) {
      enrolledCourseIds.push(courses[randInt(courses.length)].id)
    }
    students.push({
      id: `student-${i}`,
      name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`,
      cohorts,
      tags,
      enrolledCourseIds,
    })
  }
  return students
}

const COURSES = buildCourses()
const STUDENTS = buildStudents(COURSES)

const COURSES_BY_ID = new Map(COURSES.map((c) => [c.id, c]))
const STUDENTS_BY_ID = new Map(STUDENTS.map((s) => [s.id, s]))

// Reverse index: which students are enrolled in each course.
for (const student of STUDENTS) {
  for (const courseId of student.enrolledCourseIds) {
    const course = COURSES_BY_ID.get(courseId)
    if (course) course.enrolledStudentIds.push(student.id)
  }
}

/* ── field classification ────────────────────────────────────────────
   `courses` (the "pick a specific course" field) sits with the
   course-side facets for narrowing purposes (it filters by identity),
   but — matching the pre-existing UX — its own displayed count/members
   are the *students* enrolled in that course, not a course count. */
export const PEOPLE_FIELD_KEYS = ['cohorts', 'tags']
export const COURSE_FIELD_KEYS = ['subAccounts', 'courseGroups', 'instructors', 'courses']
export const LIVE_FIELD_KEYS = [...COURSE_FIELD_KEYS, ...PEOPLE_FIELD_KEYS]

export function isLiveField(fieldKey) {
  return LIVE_FIELD_KEYS.includes(fieldKey)
}

function activeValues(scope, key) {
  return scope?.[key] || []
}

function studentMatchesField(student, key, value) {
  if (key === 'cohorts') return student.cohorts.includes(value)
  if (key === 'tags') return student.tags.includes(value)
  return false
}

function courseMatchesField(course, key, value) {
  if (key === 'subAccounts') return course.subAccount === value
  if (key === 'courseGroups') return course.courseGroups.includes(value)
  if (key === 'instructors') return course.instructor === value
  if (key === 'courses') return course.label === value
  return false
}

/* A student matches the *other* people-side facets (excluding
   `excludeKey`, so a value's own count isn't narrowed by sibling
   selections within its own field) — OR within a field, AND across
   fields, which is standard faceted-filter semantics. */
function studentMatchesPeopleFacets(student, scope, excludeKey) {
  return PEOPLE_FIELD_KEYS.every((key) => {
    if (key === excludeKey) return true
    const values = activeValues(scope, key)
    if (values.length === 0) return true
    return values.some((v) => studentMatchesField(student, key, v))
  })
}

function courseMatchesCourseFacets(course, scope, excludeKey) {
  return COURSE_FIELD_KEYS.every((key) => {
    if (key === excludeKey) return true
    const values = activeValues(scope, key)
    if (values.length === 0) return true
    return values.some((v) => courseMatchesField(course, key, v))
  })
}

/* Cross-domain bridge: does this course have at least one enrolled
   student matching the currently active people-side facets? No-op
   (true) when no people-side facet is active. */
function courseMatchesPeopleFacets(course, scope) {
  const anyActive = PEOPLE_FIELD_KEYS.some((k) => activeValues(scope, k).length > 0)
  if (!anyActive) return true
  return course.enrolledStudentIds.some((id) => {
    const student = STUDENTS_BY_ID.get(id)
    return student && studentMatchesPeopleFacets(student, scope, null)
  })
}

/* Cross-domain bridge, the other direction: does this student have at
   least one enrolled course matching the currently active course-side
   facets? No-op (true) when no course-side facet is active. */
function studentMatchesCourseFacets(student, scope) {
  const anyActive = COURSE_FIELD_KEYS.some((k) => activeValues(scope, k).length > 0)
  if (!anyActive) return true
  return student.enrolledCourseIds.some((id) => {
    const course = COURSES_BY_ID.get(id)
    return course && courseMatchesCourseFacets(course, scope, null)
  })
}

/* ── public API ──────────────────────────────────────────────────────
   Both live count + matching members are derived by re-running the same
   filter, so the inspector panel and the chip/dropdown counts can never
   disagree with each other. */

function matchingStudents(fieldKey, value, scope) {
  return STUDENTS.filter(
    (s) =>
      studentMatchesField(s, fieldKey, value) &&
      studentMatchesPeopleFacets(s, scope, fieldKey) &&
      studentMatchesCourseFacets(s, scope)
  )
}

function matchingCourses(fieldKey, value, scope) {
  return COURSES.filter(
    (c) =>
      courseMatchesField(c, fieldKey, value) &&
      courseMatchesCourseFacets(c, scope, fieldKey) &&
      courseMatchesPeopleFacets(c, scope)
  )
}

function matchingStudentsForNamedCourse(value, scope) {
  const course = COURSES.find((c) => c.label === value)
  if (!course) return []
  return course.enrolledStudentIds
    .map((id) => STUDENTS_BY_ID.get(id))
    .filter((s) => s && studentMatchesPeopleFacets(s, scope, null))
}

/** Live count for a given field/value against the current scope
 *  selection. Returns `null` for fields outside the live graph
 *  (Term, Modality) so callers can fall back to static behavior. */
export function getLiveCount(fieldKey, value, scope) {
  if (!isLiveField(fieldKey)) return null
  if (fieldKey === 'courses') return matchingStudentsForNamedCourse(value, scope).length
  if (PEOPLE_FIELD_KEYS.includes(fieldKey)) return matchingStudents(fieldKey, value, scope).length
  return matchingCourses(fieldKey, value, scope).length
}

const COUNT_NOUN = {
  subAccounts: 'courses',
  courseGroups: 'courses',
  instructors: 'courses',
  courses: 'students',
  cohorts: 'students',
  tags: 'students',
}

/** e.g. "83 students" / "12 courses". Returns null for non-live fields. */
export function getLiveCountLabel(fieldKey, value, scope) {
  const count = getLiveCount(fieldKey, value, scope)
  if (count === null) return null
  return `${count.toLocaleString()} ${COUNT_NOUN[fieldKey]}`
}

/** Matching member rows for the inspector panel — same filter as the
 *  count above, so the two can never disagree. */
export function getLiveMembers(fieldKey, value, scope) {
  if (!isLiveField(fieldKey)) return []
  if (fieldKey === 'courses') {
    return matchingStudentsForNamedCourse(value, scope).map((s) => ({ id: s.id, name: s.name }))
  }
  if (PEOPLE_FIELD_KEYS.includes(fieldKey)) {
    return matchingStudents(fieldKey, value, scope).map((s) => ({ id: s.id, name: s.name }))
  }
  return matchingCourses(fieldKey, value, scope).map((c) => ({ id: c.id, name: c.label }))
}

export function getMemberKind(fieldKey) {
  return COUNT_NOUN[fieldKey] || 'items'
}
