export const institutionSnapshot = {
  metrics: [
    { label: 'Total Enrollment', value: '14,200', description: 'Active students this term' },
    { label: 'Course Activity Rate', value: '88%', description: 'Courses with recent activity' },
    { label: 'Students with No Activity', value: '215', description: 'Inactive in last 14 days' },
    { label: 'Low Engagement Courses', value: '32', description: 'Below activity threshold' },
  ],
  insight: 'Student inactivity up 3% — consider re-engagement campaigns.',
}

export const subAccountHealth = {
  categories: ['Business', 'Science', 'Arts', 'Engineering', 'Humanities', 'Health'],
  series: [
    { name: 'Low Engagement %', data: [14, 22, 8, 11, 16, 9] },
    { name: 'Instructor Inactivity %', data: [6, 18, 3, 9, 12, 5] },
  ],
  insight: 'Science dept drives most risk — 22% low engagement + 18% instructor inactivity.',
}

export const ltiAdoption = {
  categories: ['Studio', 'Zoom', 'Turnitin', 'McGraw Hill', 'Respondus', 'Proctorio'],
  series: [
    { name: 'Total Launches', data: [22400, 18200, 9800, 7600, 5400, 3200] },
    { name: 'Unique Users', data: [5100, 4800, 3200, 2100, 1800, 900] },
  ],
  insight: 'Video tools dominate usage — Studio and Zoom lead.',
}

export const facultyEngagement = {
  categories: ['Login Rate', 'Grading Speed', 'Passback', 'Discussion', 'Content Updates', 'Tool Adoption'],
  scores: [92, 78, 78, 76, 67, 62],
  insight: 'Grading turnaround (2.1 days) may slow student progression.',
}

export const courseMetrics = {
  metrics: [
    { label: 'Total Courses', value: '850', description: 'All courses this term' },
    { label: 'Unpublished', value: '12', description: 'Not yet available' },
    { label: 'Avg Score', value: '81%', description: 'Mean course grade' },
    { label: 'Below 70%', value: '55', description: 'Courses below threshold' },
    { label: 'Low Activity', value: '14', description: 'Below engagement floor' },
    { label: 'Ready for Term', value: '838', description: 'Meeting all benchmarks' },
  ],
  insight: '98% of courses meet term-start readiness benchmarks.',
}

export const courseStatus = {
  categories: ['Published', 'Unpublished', 'Concluded'],
  values: [740, 45, 2100],
  insight: 'Unpublished courses 15% above last term — possible content delay.',
}

export const coursePerformance = {
  metrics: [
    { label: 'Courses < 70%', value: '42', description: 'Below grade threshold' },
    { label: 'Low Activity Courses', value: '12', description: 'Minimal engagement' },
    { label: 'Participation Rate', value: '74%', description: 'Active student ratio' },
  ],
  breakdown: {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    data: [82, 79, 77, 75, 74, 72, 73, 74],
  },
  insight: 'Participation dropped 5% — correlates with rising sub-70% courses.',
}

export const interactionOverTime = {
  weeks: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
  series: [
    { name: 'Weekly Participation', data: [58, 62, 67, 70, 72, 75, 68, 65], yAxis: 0 },
    { name: 'Weekly Page Views', data: [62000, 71000, 78000, 82000, 86000, 92000, 88000, 88000], yAxis: 1 },
  ],
  insight: 'Engagement peaked Week 6, down 12% since — mid-term slump.',
}

export const courseReadiness = {
  categories: ['Published', 'Unpublished'],
  series: [
    { name: 'Ready', data: [790, 35], color: '#0B7488' },
    { name: 'Not Ready', data: [15, 10], color: '#E84B8A' },
  ],
  totals: { pubReady: 790, pubNotReady: 15, unpubReady: 35, unpubNotReady: 10 },
  insight: '15 published courses marked "Not Ready" — students have access to incomplete materials.',
}

export const studentOverview = {
  metrics: [
    { label: 'Total Students', value: '12,100', description: 'Enrolled this term' },
    { label: 'Avg Course Score', value: '77%', description: 'Mean across all courses' },
    { label: 'Total Submissions', value: '145K', description: 'Assignments submitted' },
    { label: '30-Day Inactive', value: '312', description: 'No activity in 30 days' },
  ],
  insight: '77% avg score — below the 80% institutional target.',
}

export const sinoa = {
  flagged: 452,
  total: 12100,
  coursesAffected: 88,
  avgFlaggedScore: 52,
  noActivity: 115,
  donutData: [
    { name: 'Flagged', y: 452, color: '#E84B8A' },
    { name: 'On Track', y: 11648, color: '#0B7488' },
  ],
  insight: '4% at-risk students concentrated in just 8% of courses.',
}
