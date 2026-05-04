import { faker } from '@faker-js/faker'

faker.seed(42)

const subAccounts = ['Business', 'Science', 'Arts', 'Engineering', 'Humanities', 'Health']
const terms = ['Fall 2025']
const statuses = ['Active', 'Inactive', 'Concluded']
const readiness = ['Ready', 'Not Ready']
const riskLevels = ['Low', 'Medium', 'High', 'Critical']

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

export function generateInstitutionTable(count = 20) {
  return {
    columns: ['Student Name', 'Email', 'Sub-account', 'Courses Enrolled', 'Last Activity', 'Status'],
    rows: Array.from({ length: count }, () => ({
      'Student Name': faker.person.fullName(),
      'Email': faker.internet.email(),
      'Sub-account': pick(subAccounts),
      'Courses Enrolled': randInt(1, 6),
      'Last Activity': faker.date.recent({ days: 30 }).toLocaleDateString(),
      'Status': pick(['Active', 'Active', 'Active', 'Inactive']),
    })),
  }
}

export function generateSubAccountTable(count = 15) {
  return {
    columns: ['Sub-account', 'Low Engagement %', 'Missing Assignments', 'Inactive Instructors', 'Risk Level', 'Trend'],
    rows: Array.from({ length: count }, () => ({
      'Sub-account': `${pick(subAccounts)} — ${faker.company.buzzNoun()}`,
      'Low Engagement %': `${randInt(5, 28)}%`,
      'Missing Assignments': randInt(50, 700),
      'Inactive Instructors': randInt(0, 8),
      'Risk Level': pick(riskLevels),
      'Trend': pick(['↑ Rising', '→ Stable', '↓ Declining']),
    })),
  }
}

export function generateLtiTable(count = 15) {
  return {
    columns: ['Tool Name', 'Category', 'Total Launches', 'Unique Users', 'Avg Session (min)', 'Sub-account'],
    rows: Array.from({ length: count }, () => ({
      'Tool Name': pick(['Studio', 'Zoom', 'Turnitin', 'McGraw Hill', 'Respondus', 'Proctorio', 'Labster', 'Pearson', 'Cengage']),
      'Category': pick(['Video & Media', 'Assessment', 'Content', 'Proctoring']),
      'Total Launches': faker.number.int({ min: 500, max: 25000 }).toLocaleString(),
      'Unique Users': faker.number.int({ min: 100, max: 6000 }).toLocaleString(),
      'Avg Session (min)': randInt(3, 45),
      'Sub-account': pick(subAccounts),
    })),
  }
}

export function generateFacultyTable(count = 20) {
  return {
    columns: ['Instructor', 'Department', 'Login Rate', 'Grading (days)', 'Passback %', 'Discussion Score', 'Tool Adoption'],
    rows: Array.from({ length: count }, () => ({
      'Instructor': faker.person.fullName(),
      'Department': pick(subAccounts),
      'Login Rate': `${randInt(60, 100)}%`,
      'Grading (days)': (Math.random() * 4 + 0.5).toFixed(1),
      'Passback %': `${randInt(50, 100)}%`,
      'Discussion Score': `${(Math.random() * 2 + 3).toFixed(1)}/5`,
      'Tool Adoption': `${randInt(30, 95)}%`,
    })),
  }
}

export function generateCourseMetricsTable(count = 20) {
  return {
    columns: ['Course Name', 'Sub-account', 'Enrollment', 'Avg Score', 'Status', 'Readiness'],
    rows: Array.from({ length: count }, () => ({
      'Course Name': `${pick(['INTRO', 'ADV', 'FUND', 'SEMINAR'])} ${randInt(100, 499)} — ${faker.company.buzzNoun()}`,
      'Sub-account': pick(subAccounts),
      'Enrollment': randInt(12, 180),
      'Avg Score': `${randInt(55, 95)}%`,
      'Status': pick(['Published', 'Published', 'Published', 'Unpublished']),
      'Readiness': pick(readiness),
    })),
  }
}

export function generateCourseStatusTable(count = 20) {
  return {
    columns: ['Course Name', 'Instructor', 'Sub-account', 'Status', 'Enrollment', 'Last Modified'],
    rows: Array.from({ length: count }, () => ({
      'Course Name': `${pick(['BUS', 'SCI', 'ART', 'ENG', 'HUM'])} ${randInt(100, 499)}`,
      'Instructor': faker.person.fullName(),
      'Sub-account': pick(subAccounts),
      'Status': pick(['Published', 'Published', 'Published', 'Unpublished', 'Concluded']),
      'Enrollment': randInt(8, 200),
      'Last Modified': faker.date.recent({ days: 14 }).toLocaleDateString(),
    })),
  }
}

export function generateCoursePerformanceTable(count = 20) {
  return {
    columns: ['Course Name', 'Instructor', 'Avg Grade', 'Participation', 'Submissions', 'Flag'],
    rows: Array.from({ length: count }, () => {
      const avg = randInt(45, 92)
      return {
        'Course Name': `${pick(['BUS', 'SCI', 'ART', 'ENG', 'HUM'])} ${randInt(100, 499)}`,
        'Instructor': faker.person.fullName(),
        'Avg Grade': `${avg}%`,
        'Participation': `${randInt(50, 95)}%`,
        'Submissions': randInt(80, 600),
        'Flag': avg < 70 ? '⚠ Below threshold' : '✓ On track',
      }
    }),
  }
}

export function generateInteractionTable(count = 8) {
  return {
    columns: ['Week', 'Participation %', 'Page Views', 'Submissions', 'Discussion Posts', 'Unique Logins'],
    rows: Array.from({ length: count }, (_, i) => ({
      'Week': `Week ${i + 1}`,
      'Participation %': `${randInt(55, 78)}%`,
      'Page Views': faker.number.int({ min: 55000, max: 95000 }).toLocaleString(),
      'Submissions': faker.number.int({ min: 8000, max: 22000 }).toLocaleString(),
      'Discussion Posts': faker.number.int({ min: 1200, max: 5500 }).toLocaleString(),
      'Unique Logins': faker.number.int({ min: 8000, max: 12000 }).toLocaleString(),
    })),
  }
}

export function generateCourseReadinessTable(count = 20) {
  return {
    columns: ['Course Name', 'Instructor', 'Published', 'Has Assignments', 'Syllabus', 'Instructor Enrolled', 'Ready'],
    rows: Array.from({ length: count }, () => {
      const pub = Math.random() > 0.15
      const assign = Math.random() > 0.1
      const syll = Math.random() > 0.2
      const instr = Math.random() > 0.05
      return {
        'Course Name': `${pick(['BUS', 'SCI', 'ART', 'ENG', 'HUM'])} ${randInt(100, 499)}`,
        'Instructor': faker.person.fullName(),
        'Published': pub ? '✓' : '✗',
        'Has Assignments': assign ? '✓' : '✗',
        'Syllabus': syll ? '✓' : '✗',
        'Instructor Enrolled': instr ? '✓' : '✗',
        'Ready': (pub && assign && syll && instr) ? '✓ Ready' : '✗ Not Ready',
      }
    }),
  }
}

export function generateStudentOverviewTable(count = 20) {
  return {
    columns: ['Student Name', 'Email', 'Courses', 'Avg Score', 'Submissions', 'Last Active', 'Status'],
    rows: Array.from({ length: count }, () => ({
      'Student Name': faker.person.fullName(),
      'Email': faker.internet.email(),
      'Courses': randInt(1, 6),
      'Avg Score': `${randInt(45, 98)}%`,
      'Submissions': randInt(5, 85),
      'Last Active': faker.date.recent({ days: 45 }).toLocaleDateString(),
      'Status': pick(['Active', 'Active', 'Active', '30-Day Inactive']),
    })),
  }
}

export function generateSinoaTable(count = 20) {
  return {
    columns: ['Student Name', 'Course', 'Current Grade', 'Risk Signal', 'Last Activity', 'Advisor'],
    rows: Array.from({ length: count }, () => ({
      'Student Name': faker.person.fullName(),
      'Course': `${pick(['BUS', 'SCI', 'ART', 'ENG', 'HUM'])} ${randInt(100, 499)}`,
      'Current Grade': `${randInt(22, 64)}%`,
      'Risk Signal': pick(['Declining grades', 'Low submissions', 'No activity 10+ days', 'Declining + Low submissions']),
      'Last Activity': faker.date.recent({ days: 21 }).toLocaleDateString(),
      'Advisor': faker.person.fullName(),
    })),
  }
}
