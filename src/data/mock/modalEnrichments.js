/* Filters, AI summaries, and methodology for each widget's modal view */

export const institutionSnapshotModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024', 'All Terms'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering', 'Humanities'] },
    { label: 'Enrollment Status', options: ['All Students', 'Active Only', 'Concluded', 'Inactive'] },
  ],
  aiSummary: 'Enrollment remains stable at 14,200 but inactivity has risen 3% week-over-week, concentrated in the Science and Humanities sub-accounts. The 215 inactive students represent a recoverable segment — 68% were active within the last 30 days. Recommend targeted engagement nudges through Canvas notifications before the mid-term assessment window closes.',
  methodology: 'Total Enrollment counts all students with an active or completed enrollment in at least one published course for the selected term. Course Activity Rate measures the percentage of published courses with at least one student interaction (page view, submission, or discussion post) in the last 7 days. Inactivity is defined as zero Canvas page views or API interactions for 14+ consecutive days.',
}

export const subAccountHealthModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Risk Level', options: ['All Levels', 'High Risk', 'Medium Risk', 'Low Risk'] },
    { label: 'Metric', options: ['All Metrics', 'Low Engagement', 'Missing Assignments', 'Instructor Inactivity'] },
  ],
  aiSummary: 'Science consistently leads in missing assignments (642), nearly double the next sub-account (Engineering at 410). This pattern has persisted for 3 consecutive weeks and correlates with a staffing gap — 4 adjunct instructors in Science have below-average grading turnaround times. Business shows moderate engagement risk (14%) but stable assignment completion. Arts remains the healthiest sub-account across all risk indicators.',
  methodology: 'Sub-account health aggregates three risk signals: Low Engagement (% of students with fewer than 3 Canvas sessions/week), Missing Assignments (total unsubmitted assignments past due by 48+ hours), and Instructor Inactivity (instructors with no Canvas login for 5+ business days). Each sub-account inherits the Canvas account hierarchy. Data refreshes every 4 hours from the Canvas Data warehouse.',
}

export const ltiAdoptionModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Tool Category', options: ['All Tools', 'Video & Media', 'Assessment', 'Content', 'Proctoring'] },
  ],
  aiSummary: 'Video tools (Studio + Zoom) account for 61% of all LTI launches, suggesting heavy reliance on synchronous and recorded instruction. Turnitin adoption is strong in writing-intensive programs but underutilized in STEM. McGraw Hill usage dropped 12% from last term — worth investigating whether course material changes or license renewals are factors. Respondus and Proctorio show expected seasonal spikes aligned with exam periods.',
  methodology: 'LTI launch data is captured via Canvas LTI 1.3 event callbacks. Total Launches counts each tool session initiation (deduplicated within a 5-minute window to filter rapid reloads). Unique Users counts distinct Canvas user IDs per tool per term. Tools are categorized by their primary function in the LTI tool registry. Data excludes admin and test account launches.',
}

export const facultyEngagementModal = {
  filters: [
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Role', options: ['All Instructors', 'Full-time Faculty', 'Adjunct', 'Teaching Assistants'] },
    { label: 'Time Period', options: ['Last 7 Days', 'Last 30 Days', 'This Term', 'Last Term'] },
  ],
  aiSummary: 'Login rates are strong at 92%, indicating faculty presence, but the 2.1-day average grading turnaround creates a feedback bottleneck affecting 340+ students waiting on grades. Tool adoption at 62% suggests a training opportunity — departments with dedicated Canvas champions show 85%+ adoption. Discussion response quality (3.8/5) varies significantly by department: Business averages 4.2 while Science trails at 3.1.',
  methodology: 'Login Rate tracks unique instructor logins within the selected period divided by total active instructors. Grading Turnaround measures median hours from submission timestamp to grade posting. Passback Completion is the percentage of graded assignments successfully synced to the Canvas gradebook via LTI. Discussion Response measures instructor reply frequency and timeliness in discussion boards, scored on a 5-point composite. Content Updates counts course module edits, page updates, and new resource uploads per instructor per month.',
}

export const courseMetricsModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Course State', options: ['All States', 'Published', 'Unpublished', 'Concluded'] },
  ],
  aiSummary: 'The 81% average score is stable but masks a bimodal distribution: 72% of courses cluster above 80%, while 55 courses sit below 70%, primarily in introductory STEM sequences. The 12 unpublished courses are all scheduled for late-start sessions and are on track. The 14 low-activity courses should be reviewed — 8 of them have fewer than 10 enrolled students, which may explain the low engagement signal.',
  methodology: 'Total Courses includes all course shells created for the selected term, regardless of enrollment. Avg Score is the enrollment-weighted mean of current course grades across all active students. Below 70% flags courses where the median student grade falls under 70%. Low Activity identifies courses with fewer than 5 unique student sessions in the past 7 days. Ready for Term requires: published status, at least one graded assignment, a populated syllabus, and an instructor enrolled.',
}

export const courseStatusModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024', 'All Terms'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { type: 'toggle', label: 'With activity', defaultChecked: true },
  ],
  aiSummary: 'The 45 unpublished courses represent a 15% increase over the same point last term. Of these, 28 belong to instructors who also had late publications last term — this is a recurring pattern rather than a new issue. The 2,100 concluded courses include 180 from the summer session that are pending archival. Consider automated publishing reminders for repeat late-publishers 2 weeks before term start.',
  methodology: 'Course status is pulled from the Canvas Courses API workflow_state field. Published = "available", Unpublished = "unpublished" or "created", Concluded = "completed". Counts reflect the current state at data refresh time (hourly). Historical comparisons use a snapshot taken at the same relative point in the previous term.',
}

export const coursePerformanceModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Grade Threshold', options: ['Below 70%', 'Below 60%', 'Below 50%', 'Custom'] },
  ],
  aiSummary: 'Participation has declined 5% since Week 5, mirroring a pattern seen in 3 of the last 4 terms at this point in the semester. The 42 courses below 70% share common characteristics: large sections (80+ students), limited discussion board usage, and infrequent assignment variety. Courses with weekly low-stakes quizzes show 18% higher participation than lecture-only formats. The 12 low-activity courses overlap significantly with the sub-70% group.',
  methodology: 'Participation Rate is calculated as (students with ≥1 Canvas interaction in the past 7 days) / (total enrolled students) across all published courses. Below 70% flags courses where the current median grade is under the threshold. Weekly trend data is computed every Monday at 00:00 UTC. Low Activity Courses have fewer than 5 unique student sessions per week for 2+ consecutive weeks.',
}

export const interactionOverTimeModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Date Range', options: ['Full Term', 'Last 4 Weeks', 'Last 2 Weeks', 'Custom'] },
  ],
  aiSummary: 'The Week 6 engagement peak aligns with midterm assessment deadlines, a pattern consistent across previous terms. The subsequent 12% decline is within historical norms but steeper than Fall 2024 (8% decline). Page views remain elevated at 88K despite the participation drop, suggesting students are consuming content but not actively submitting. This "passive engagement" pattern often precedes a recovery in Week 9-10 as final project deadlines approach.',
  methodology: 'Weekly Participation counts distinct students with at least one graded submission, discussion post, or quiz attempt in a given week. Weekly Page Views aggregates all authenticated Canvas page impressions (excluding API calls and automated requests). Both metrics are computed on a Monday-to-Sunday week boundary. The dual-axis chart uses independent scales to show correlation between activity volume and active participation.',
}

export const courseReadinessModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Readiness Status', options: ['All', 'Ready', 'Not Ready'] },
  ],
  aiSummary: 'The 15 published but "Not Ready" courses are the highest priority — students can access these courses but may encounter incomplete content, missing rubrics, or unlinked assignments. 9 of these belong to 3 instructors who are new this term and may need onboarding support. The 10 unpublished/not-ready courses have 3+ weeks before their scheduled start date and are within normal preparation timelines.',
  methodology: 'Readiness is a composite check against 4 criteria: (1) at least one graded assignment exists, (2) the course syllabus page is populated, (3) an instructor with an active enrollment is present, and (4) course navigation includes at least Assignments, Grades, and Modules. A course is "Ready" only if all 4 criteria are met. Published status is independent of readiness — a course can be published but not ready.',
}

export const studentOverviewModal = {
  filters: [
    { label: 'Term', options: ['Fall 2025', 'Spring 2025', 'Summer 2024'] },
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Student Status', options: ['All Students', 'Active', '30-Day Inactive', 'At-Risk'] },
  ],
  aiSummary: 'The 77% average score sits 3 points below the institutional 80% target and has been trending downward for 3 consecutive weeks. The 312 inactive students (30+ days) break down as: 45% never logged in after enrollment, 35% disengaged after Week 3, and 20% stopped after midterms. The 145K submissions represent a healthy volume, but on-time submission rates have dropped to 71% — late submissions correlate with the lower average scores.',
  methodology: 'Total Students counts all users with at least one active enrollment in the selected term. Avg Course Score is a student-weighted mean across all enrollments (students in multiple courses contribute once per course). Total Submissions includes all assignment, quiz, and discussion submissions regardless of grade status. 30-Day Inactive flags students with zero Canvas page views or API interactions for 30+ consecutive calendar days.',
}

export const sinoaModal = {
  filters: [
    { label: 'Sub-account', options: ['All Sub-accounts', 'Business', 'Science', 'Arts', 'Engineering'] },
    { label: 'Risk Level', options: ['All Flagged', 'Critical (< 40%)', 'High (40-55%)', 'Moderate (55-65%)'] },
    { label: 'Courses', options: ['All Courses', 'Courses with 5+ Flagged', 'Courses with 10+ Flagged'] },
  ],
  aiSummary: 'The 452 flagged students represent 3.7% of enrollment but are concentrated in just 88 courses (10.4% of the catalog), indicating systemic rather than individual issues. The average flagged score of 52% is well below passing thresholds. 115 students show zero activity — these are the most urgent cases for advisor outreach. Among the active but flagged students, 78% have submitted at least one assignment in the last 2 weeks, suggesting they are still reachable through course-level interventions like targeted feedback and office hour invitations.',
  methodology: 'Students are flagged as "In Need of Attention" (SINOA) when their current cumulative grade falls below 65% AND they meet at least one additional risk signal: declining grade trend (3+ consecutive weeks of grade drops), low submission rate (< 50% of assigned work submitted), or extended inactivity (10+ days without a Canvas session). The model runs nightly and maintains a rolling 7-day lookback for activity signals. Flagged students are automatically surfaced to advisors through the Canvas student pathway integration.',
}
