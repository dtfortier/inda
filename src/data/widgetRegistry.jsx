/* Single source of truth for every widget that can appear on the
   dashboard or in the widget library. Both Dashboard.jsx and the
   Customize page iterate this registry rather than inlining widgets. */

import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import KPIGrid from '../components/widgets/KPIGrid.jsx'
import * as data from './mock/widgetData.js'
import * as modal from './mock/modalEnrichments.js'
import * as tables from './mock/tableData.js'
import { computeMetricStatuses, buildDynamicInsight } from '../utils/monitoring.js'

/* ── Chart option helpers (lifted from Dashboard.jsx) ─────────────── */

function pinTooltipToLastPoint(chart) {
  if (!chart || !chart.series) return
  const series = chart.series.find((s) => s.visible && s.points?.length)
  if (!series) return
  const last = series.points[series.points.length - 1]
  if (last) chart.tooltip.refresh(last)
}

const pinLastPointTooltip = {
  load() {
    const chart = this
    chart.tooltip.hide = () => {}
    const pin = () => pinTooltipToLastPoint(chart)
    pin()
    setTimeout(pin, 0)
    setTimeout(pin, 300)
    chart.container.addEventListener('mouseleave', pin)
  },
}

function barChart(categories, series, horizontal = false) {
  return {
    chart: { type: horizontal ? 'bar' : 'column', height: 260 },
    xAxis: { categories },
    yAxis: { title: { text: null } },
    series,
    legend: { enabled: series.length > 1 },
  }
}

function lineChart(categories, series, dualAxis = false) {
  const yAxis = dualAxis
    ? [
        { title: { text: null }, labels: { enabled: false }, gridLineWidth: 0 },
        { title: { text: null }, labels: { enabled: false }, gridLineWidth: 0, opposite: true },
      ]
    : { title: { text: null } }
  return {
    chart: { type: 'spline', height: 280, events: pinLastPointTooltip },
    xAxis: { categories },
    yAxis,
    series,
    legend: { enabled: true },
  }
}

function donutChart(seriesData, centerLabel) {
  return {
    chart: { type: 'pie', height: 260, marginBottom: 50 },
    legend: { enabled: true },
    plotOptions: {
      pie: {
        innerSize: '60%',
        size: '80%',
        dataLabels: { enabled: false },
        showInLegend: true,
      },
    },
    series: [{ name: 'Students', data: seriesData }],
    subtitle: centerLabel
      ? { text: centerLabel, align: 'center', verticalAlign: 'middle', y: 5, style: { fontSize: '28px', fontWeight: '700', fontFamily: "'Inclusive Sans', sans-serif", color: '#273540' } }
      : undefined,
  }
}

function scoredBarList(categories, scores) {
  return {
    chart: { type: 'bar', height: 260 },
    xAxis: { categories },
    yAxis: { title: { text: null }, max: 100 },
    series: [{ name: 'Score', data: scores, showInLegend: false }],
    plotOptions: { bar: { dataLabels: { enabled: false } } },
  }
}

function stackedBar(categories, values) {
  return {
    chart: { type: 'bar', height: 200 },
    xAxis: { categories: ['Courses'] },
    yAxis: { title: { text: null } },
    plotOptions: { series: { stacking: 'normal' } },
    series: categories.map((cat, i) => ({ name: cat, data: [values[i]] })),
    legend: { enabled: true },
  }
}

function stackedBar100(categories, series) {
  return {
    chart: { type: 'bar', height: 180, marginLeft: 100 },
    xAxis: {
      categories,
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        enabled: true,
        style: { color: '#273540', fontSize: '12px', fontWeight: '600', fontFamily: "'Inclusive Sans', sans-serif" },
      },
    },
    yAxis: { title: { text: null }, labels: { enabled: false }, gridLineWidth: 0 },
    plotOptions: { series: { stacking: 'percent', borderWidth: 2, borderColor: '#ffffff', borderRadius: 2 } },
    series,
    legend: { enabled: true },
    tooltip: { pointFormat: '{series.name}: <b>{point.y}</b> courses ({point.percentage:.1f}%)' },
  }
}

/* ── Modal-side chart helpers (gridlines, axes, larger heights) ─── */

const modalAxis = {
  xAxis: {
    lineWidth: 1,
    lineColor: '#e0e0e0',
    tickLength: 4,
    tickColor: '#e0e0e0',
    labels: { enabled: true, style: { color: '#576773', fontSize: '11px' } },
    title: { text: null },
  },
  yAxis: {
    gridLineWidth: 1,
    gridLineColor: '#f0f0f0',
    lineWidth: 0,
    labels: { enabled: true, style: { color: '#576773', fontSize: '11px' } },
    title: { text: null },
  },
}

function modalBarChart(categories, series, horizontal = false) {
  return {
    chart: { type: horizontal ? 'bar' : 'column', height: 360 },
    ...modalAxis,
    xAxis: { ...modalAxis.xAxis, categories },
    series,
    legend: { enabled: series.length > 1 },
    plotOptions: { series: { dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: '600', color: '#273540' } } } },
  }
}

function modalLineChart(categories, series, dualAxis = false) {
  const yAxis = dualAxis
    ? [
        { ...modalAxis.yAxis, title: { text: 'Participation %' }, labels: { ...modalAxis.yAxis.labels, format: '{value}%' } },
        { ...modalAxis.yAxis, title: { text: 'Page Views' }, labels: { ...modalAxis.yAxis.labels }, opposite: true },
      ]
    : { ...modalAxis.yAxis }
  return {
    chart: { type: 'spline', height: 360 },
    xAxis: { ...modalAxis.xAxis, categories },
    yAxis,
    series,
    legend: { enabled: true },
    plotOptions: { spline: { dataLabels: { enabled: true, style: { fontSize: '10px', color: '#576773' } } } },
  }
}

function modalDonutChart(seriesData, centerLabel) {
  return {
    chart: { type: 'pie', height: 340 },
    plotOptions: {
      pie: {
        innerSize: '55%',
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y}', style: { fontSize: '13px', color: '#273540' } },
        showInLegend: true,
      },
    },
    series: [{ name: 'Students', data: seriesData }],
    subtitle: centerLabel
      ? { text: centerLabel, align: 'center', verticalAlign: 'middle', x: -10, y: 17, style: { fontSize: '32px', fontWeight: '700', fontFamily: "'Inclusive Sans', sans-serif", color: '#273540' } }
      : undefined,
  }
}

function modalScoredBarList(categories, scores) {
  return {
    chart: { type: 'bar', height: 360 },
    ...modalAxis,
    xAxis: { ...modalAxis.xAxis, categories },
    yAxis: { ...modalAxis.yAxis, max: 100, labels: { ...modalAxis.yAxis.labels, format: '{value}%' } },
    series: [{ name: 'Score', data: scores, showInLegend: false }],
    plotOptions: { bar: { dataLabels: { enabled: true, format: '{y}%', style: { fontSize: '12px', fontWeight: '600', color: '#273540' } } } },
  }
}

function modalStackedBar(categories, values) {
  return {
    chart: { type: 'bar', height: 300 },
    ...modalAxis,
    xAxis: { ...modalAxis.xAxis, categories: ['Courses'] },
    plotOptions: { series: { stacking: 'normal', dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: '600', color: '#fff' } } } },
    series: categories.map((cat, i) => ({ name: cat, data: [values[i]] })),
    legend: { enabled: true },
  }
}

function modalStackedBar100(categories, series) {
  return {
    chart: { type: 'bar', height: 250 },
    ...modalAxis,
    xAxis: { ...modalAxis.xAxis, categories },
    yAxis: { ...modalAxis.yAxis, labels: { ...modalAxis.yAxis.labels, format: '{value}%' } },
    plotOptions: { series: { stacking: 'percent', borderWidth: 2, borderColor: '#ffffff', borderRadius: 2, dataLabels: { enabled: true, format: '{point.y}', style: { fontSize: '12px', fontWeight: '600', color: '#fff' } } } },
    series,
    legend: { enabled: true },
    tooltip: { pointFormat: '{series.name}: <b>{point.y}</b> courses ({point.percentage:.1f}%)' },
  }
}

/* ── Mock data for library-only widgets (not on the default
   dashboard, but available to add). Kept lightweight on purpose. */

const PLACEHOLDER = {
  gradeDistribution: {
    categories: ['A', 'B', 'C', 'D', 'F'],
    counts: [820, 1240, 760, 280, 95],
    insight: 'B-grade volume is up 6% term over term, while D and F counts are flat.',
  },
  assignmentCompletion: {
    breakdown: [
      { name: 'On time', y: 68 },
      { name: 'Late', y: 23 },
      { name: 'Missing', y: 9 },
    ],
    insight: 'On-time submission held above the 65% target across all sub-accounts this week.',
  },
  loginActivity: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    counts: [4200, 4480, 4720, 4310, 4050, 1880, 2120],
    insight: 'Weekday logins are tracking 4% above last term; weekend activity remains low.',
  },
  discussion: {
    metrics: [
      { value: '8,420', label: 'Posts', description: 'Across all course discussions this term.' },
      { value: '12.4k', label: 'Replies', description: 'Replies posted this term.' },
      { value: '3,180', label: 'Active participants', description: 'Unique contributors.' },
    ],
    insight: 'Reply-to-post ratio is steady at ~1.5, indicating healthy back-and-forth.',
  },
}

/* ── Widget registry ────────────────────────────────────────────── */

/* Each entry describes one widget. `column` is its default home, and
   `defaultSize` (large column only) sets full vs half. `render`
   produces the body shown inside the WidgetCard; `renderModal`
   provides the larger detail variant. `available` filters and
   `defaultMonitoring` rules feed the EditWidgetModal. */

export const WIDGET_REGISTRY = {
  'inst-snap': {
    title: 'Institution Snapshot',
    type: 'KPI metrics',
    column: 'large',
    defaultSize: 'full',
    description: 'Top-line institutional KPIs: enrollment, activity rate, and overall health.',
    insight: ({ monitoring } = {}) =>
      buildDynamicInsight(data.institutionSnapshot.insight, monitoring, data.institutionSnapshot.metrics),
    render: ({ monitoring } = {}) => (
      <KPIGrid
        metrics={data.institutionSnapshot.metrics}
        statuses={computeMetricStatuses(monitoring, data.institutionSnapshot.metrics)}
      />
    ),
    renderModal: () => <KPIGrid metrics={data.institutionSnapshot.metrics} showDescription />,
    modal: {
      filters: modal.institutionSnapshotModal.filters,
      methodology: modal.institutionSnapshotModal.methodology,
      aiSummary: modal.institutionSnapshotModal.aiSummary,
      tableData: () => tables.generateInstitutionTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Total Enrollment', 'Course Activity Rate', 'Students with No Activity', 'Low Engagement Courses'],
    /* Tuned to fire against the seeded mock values:
        Course Activity Rate is 88 → ≥ 85 → goal "On Target"
        Total Enrollment is 14,200 → ≥ 12,000 → goal "On Target"
        Students with No Activity is 215 → > 200 → threshold fires "At Risk" */
    defaultMonitoring: [
      { type: 'goal', metric: 'Course Activity Rate', condition: 'Greater than or equal to', target: 85, unit: '%', alert: true },
      { type: 'goal', metric: 'Total Enrollment', condition: 'Greater than or equal to', target: 12000, unit: '', alert: false },
      { type: 'threshold', metric: 'Students with No Activity', condition: 'Greater than', target: 200, unit: '', alert: true },
    ],
  },
  'sub-health': {
    title: 'Sub-Account Health',
    type: 'Bar chart',
    column: 'large',
    defaultSize: 'full',
    description: 'Low-engagement percentage for each sub-account, ranked worst to best.',
    insight: data.subAccountHealth.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={barChart(data.subAccountHealth.categories, data.subAccountHealth.series)} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalBarChart(data.subAccountHealth.categories, data.subAccountHealth.series)} />
    ),
    modal: {
      filters: modal.subAccountHealthModal.filters,
      methodology: modal.subAccountHealthModal.methodology,
      aiSummary: modal.subAccountHealthModal.aiSummary,
      tableData: () => tables.generateSubAccountTable(),
    },
    filters: ['term', 'risk-level', 'metric', 'visualization'],
    metrics: ['Low Engagement %', 'Instructor Inactivity %', 'At-Risk Students'],
    defaultMonitoring: [
      { type: 'goal', metric: 'Low Engagement %', condition: 'Less than', target: 20, unit: '%', alert: true },
      { type: 'threshold', metric: 'Instructor Inactivity %', condition: 'Greater than', target: 30, unit: '%', alert: true },
      { type: 'threshold', metric: 'At-Risk Students', condition: 'Greater than', target: 100, unit: '', alert: false },
    ],
  },
  'course-status': {
    title: 'Course Status',
    type: 'Stacked bar',
    column: 'large',
    defaultSize: 'full',
    description: 'Published vs. unpublished vs. concluded courses across the term.',
    insight: data.courseStatus.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={stackedBar(data.courseStatus.categories, data.courseStatus.values)} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalStackedBar(data.courseStatus.categories, data.courseStatus.values)} />
    ),
    modal: {
      filters: modal.courseStatusModal.filters,
      methodology: modal.courseStatusModal.methodology,
      aiSummary: modal.courseStatusModal.aiSummary,
      tableData: () => tables.generateCourseStatusTable(),
    },
    filters: ['term', 'metric', 'visualization'],
    metrics: ['Published Courses', 'Unpublished Courses', 'Concluded Courses'],
    defaultMonitoring: [
      { type: 'threshold', metric: 'Unpublished Courses', condition: 'Greater than', target: 50, unit: '', alert: true },
    ],
  },
  'lti-adoption-lg': {
    title: 'LTI Adoption',
    type: 'Horizontal bar',
    column: 'large',
    defaultSize: 'half',
    description: 'Which external tools are used most — total launches and unique users.',
    insight: data.ltiAdoption.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={barChart(data.ltiAdoption.categories, data.ltiAdoption.series, true)} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalBarChart(data.ltiAdoption.categories, data.ltiAdoption.series, true)} />
    ),
    modal: {
      filters: modal.ltiAdoptionModal.filters,
      methodology: modal.ltiAdoptionModal.methodology,
      aiSummary: modal.ltiAdoptionModal.aiSummary,
      tableData: () => tables.generateLtiTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Total Launches', 'Unique Users'],
    defaultMonitoring: [],
  },
  'course-perf': {
    title: 'Course Performance',
    type: 'Line chart',
    column: 'large',
    defaultSize: 'half',
    description: 'Weekly participation trend across all courses — spot dips early.',
    insight: data.coursePerformance.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={{
        chart: { type: 'spline', height: 200, events: pinLastPointTooltip },
        xAxis: { categories: data.coursePerformance.breakdown.categories },
        yAxis: { title: { text: null } },
        tooltip: { pointFormat: '<b>{point.y}%</b> participation' },
        series: [{ name: 'Participation', data: data.coursePerformance.breakdown.data, showInLegend: false }],
      }} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={{
        chart: { type: 'spline', height: 360 },
        ...modalAxis,
        xAxis: { ...modalAxis.xAxis, categories: data.coursePerformance.breakdown.categories },
        yAxis: { ...modalAxis.yAxis, labels: { ...modalAxis.yAxis.labels, format: '{value}%' } },
        series: [{ name: 'Participation', data: data.coursePerformance.breakdown.data, showInLegend: false }],
        plotOptions: { spline: { dataLabels: { enabled: true, format: '{y}%', style: { fontSize: '11px', color: '#576773' } } } },
      }} />
    ),
    modal: {
      filters: modal.coursePerformanceModal.filters,
      methodology: modal.coursePerformanceModal.methodology,
      aiSummary: modal.coursePerformanceModal.aiSummary,
      tableData: () => tables.generateCoursePerformanceTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Participation Rate', 'Below 70% Score'],
    defaultMonitoring: [
      { type: 'goal', metric: 'Participation Rate', condition: 'Greater than', target: 75, unit: '%', alert: true },
    ],
  },
  'interaction': {
    title: 'Interaction Over Time',
    type: 'Line chart',
    column: 'large',
    defaultSize: 'full',
    description: 'Weekly participation rate alongside total page-view volume.',
    insight: data.interactionOverTime.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={lineChart(data.interactionOverTime.weeks, data.interactionOverTime.series, true)} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalLineChart(data.interactionOverTime.weeks, data.interactionOverTime.series, true)} />
    ),
    modal: {
      filters: modal.interactionOverTimeModal.filters,
      methodology: modal.interactionOverTimeModal.methodology,
      aiSummary: modal.interactionOverTimeModal.aiSummary,
      tableData: () => tables.generateInteractionTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Weekly Participation', 'Page Views'],
    defaultMonitoring: [
      { type: 'threshold', metric: 'Weekly Participation', condition: 'Less than', target: 60, unit: '%', alert: true },
    ],
  },
  'course-readiness': {
    title: 'Course Readiness',
    type: 'Stacked bar',
    column: 'large',
    defaultSize: 'full',
    description: 'Share of courses ready to launch vs. missing setup essentials.',
    insight: data.courseReadiness.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={stackedBar100(data.courseReadiness.categories, data.courseReadiness.series)} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalStackedBar100(data.courseReadiness.categories, data.courseReadiness.series)} />
    ),
    modal: {
      filters: modal.courseReadinessModal.filters,
      methodology: modal.courseReadinessModal.methodology,
      aiSummary: modal.courseReadinessModal.aiSummary,
      tableData: () => tables.generateCourseReadinessTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Courses Ready', 'Missing Setup'],
    defaultMonitoring: [
      { type: 'goal', metric: 'Courses Ready', condition: 'Greater than', target: 90, unit: '%', alert: true },
    ],
  },
  'students-need': {
    title: 'Students in Need of Attention',
    type: 'Donut chart',
    column: 'medium',
    description: 'Count of flagged students, surfacing who needs intervention now.',
    insight: data.sinoa.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={donutChart(data.sinoa.donutData, `${data.sinoa.flagged}`)} />
    ),
    renderModal: () => (
      <div className="sinoa-modal-content">
        <div className="sinoa-modal-chart">
          <HighchartsReact highcharts={Highcharts} options={modalDonutChart(data.sinoa.donutData, `${data.sinoa.flagged}`)} />
        </div>
        <div className="sinoa-stats">
          <div className="sinoa-stat">
            <span className="sinoa-stat-value">{data.sinoa.coursesAffected}</span>
            <span className="sinoa-stat-label">Courses Affected</span>
          </div>
          <div className="sinoa-stat">
            <span className="sinoa-stat-value">{data.sinoa.avgFlaggedScore}%</span>
            <span className="sinoa-stat-label">Avg Flagged Score</span>
          </div>
          <div className="sinoa-stat">
            <span className="sinoa-stat-value">{data.sinoa.noActivity}</span>
            <span className="sinoa-stat-label">No Activity</span>
          </div>
        </div>
      </div>
    ),
    modal: {
      filters: modal.sinoaModal.filters,
      methodology: modal.sinoaModal.methodology,
      aiSummary: modal.sinoaModal.aiSummary,
      tableData: () => tables.generateSinoaTable(),
    },
    filters: ['term', 'risk-level', 'metric'],
    metrics: ['Flagged Students', 'No Activity Students', 'Avg Flagged Score'],
    defaultMonitoring: [
      { type: 'threshold', metric: 'Flagged Students', condition: 'Greater than', target: 400, unit: '', alert: true },
    ],
  },
  'student-overview': {
    title: 'Student Overview',
    type: 'KPI metrics',
    column: 'medium',
    description: 'High-level student stats: active, at-risk, and inactive counts.',
    insight: ({ monitoring } = {}) =>
      buildDynamicInsight(data.studentOverview.insight, monitoring, data.studentOverview.metrics),
    render: ({ monitoring } = {}) => (
      <KPIGrid
        metrics={data.studentOverview.metrics}
        statuses={computeMetricStatuses(monitoring, data.studentOverview.metrics)}
      />
    ),
    renderModal: () => <KPIGrid metrics={data.studentOverview.metrics} showDescription />,
    modal: {
      filters: modal.studentOverviewModal.filters,
      methodology: modal.studentOverviewModal.methodology,
      aiSummary: modal.studentOverviewModal.aiSummary,
      tableData: () => tables.generateStudentOverviewTable(),
    },
    filters: ['term', 'risk-level', 'metric'],
    metrics: ['Total Students', 'Avg Course Score', 'Total Submissions', '30-Day Inactive'],
    /* Avg Course Score is 77% → < 80% goal → no goal-met badge.
        30-Day Inactive is 312 → > 250 threshold → "At Risk" fires. */
    defaultMonitoring: [
      { type: 'goal', metric: 'Avg Course Score', condition: 'Greater than or equal to', target: 80, unit: '%', alert: true },
      { type: 'threshold', metric: '30-Day Inactive', condition: 'Greater than', target: 250, unit: '', alert: true },
    ],
  },
  'faculty': {
    title: 'Faculty Engagement',
    type: 'Scored bars',
    column: 'medium',
    description: 'Faculty activity score by department — coursework, grading, feedback.',
    insight: data.facultyEngagement.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={scoredBarList(data.facultyEngagement.categories, data.facultyEngagement.scores)} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalScoredBarList(data.facultyEngagement.categories, data.facultyEngagement.scores)} />
    ),
    modal: {
      filters: modal.facultyEngagementModal.filters,
      methodology: modal.facultyEngagementModal.methodology,
      aiSummary: modal.facultyEngagementModal.aiSummary,
      tableData: () => tables.generateFacultyTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Engagement Score', 'Grading Turnaround', 'Discussion Response'],
    defaultMonitoring: [
      { type: 'goal', metric: 'Engagement Score', condition: 'Greater than or equal to', target: 80, unit: '', alert: true },
    ],
  },
  'course-metrics': {
    title: 'Course Metrics',
    type: 'KPI metrics',
    column: 'medium',
    description: 'Quick course-level stats: size, pacing, completion, and grade spread.',
    insight: ({ monitoring } = {}) =>
      buildDynamicInsight(data.courseMetrics.insight, monitoring, data.courseMetrics.metrics),
    render: ({ monitoring } = {}) => (
      <KPIGrid
        metrics={data.courseMetrics.metrics}
        statuses={computeMetricStatuses(monitoring, data.courseMetrics.metrics)}
      />
    ),
    renderModal: () => <KPIGrid metrics={data.courseMetrics.metrics} showDescription columns={3} />,
    modal: {
      filters: modal.courseMetricsModal.filters,
      methodology: modal.courseMetricsModal.methodology,
      aiSummary: modal.courseMetricsModal.aiSummary,
      tableData: () => tables.generateCourseMetricsTable(),
    },
    filters: ['term', 'metric'],
    metrics: ['Total Courses', 'Unpublished', 'Avg Score', 'Below 70%', 'Low Activity', 'Ready for Term'],
    /* Avg Score is 81 → ≥ 80 → goal On Target.
        Below 70% is 55 → > 40 → threshold At Risk. */
    defaultMonitoring: [
      { type: 'goal', metric: 'Avg Score', condition: 'Greater than or equal to', target: 80, unit: '%', alert: true },
      { type: 'threshold', metric: 'Below 70%', condition: 'Greater than', target: 40, unit: '', alert: true },
    ],
  },

  /* ── Library-only widgets (not on the default dashboard but
        available to drag in). They render lightweight placeholder
        charts with realistic mock data. ── */

  'grade-dist': {
    title: 'Grade Distribution',
    type: 'Bar chart',
    column: 'large',
    defaultSize: 'full',
    description: 'Distribution of final grades across all active courses.',
    insight: PLACEHOLDER.gradeDistribution.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={barChart(PLACEHOLDER.gradeDistribution.categories, [{ name: 'Students', data: PLACEHOLDER.gradeDistribution.counts, showInLegend: false }])} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalBarChart(PLACEHOLDER.gradeDistribution.categories, [{ name: 'Students', data: PLACEHOLDER.gradeDistribution.counts, showInLegend: false }])} />
    ),
    filters: ['term', 'metric'],
    metrics: ['Grade Counts', 'Pass Rate'],
    defaultMonitoring: [
      { type: 'threshold', metric: 'Pass Rate', condition: 'Less than', target: 80, unit: '%', alert: true },
    ],
  },
  'assign-completion': {
    title: 'Assignment Completion',
    type: 'Donut chart',
    column: 'medium',
    description: 'Ratio of assignments submitted on time vs. late vs. missing.',
    insight: PLACEHOLDER.assignmentCompletion.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={donutChart(PLACEHOLDER.assignmentCompletion.breakdown, '68%')} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={modalDonutChart(PLACEHOLDER.assignmentCompletion.breakdown, '68%')} />
    ),
    filters: ['term', 'metric'],
    metrics: ['On-time Rate', 'Late Rate', 'Missing Rate'],
    defaultMonitoring: [
      { type: 'goal', metric: 'On-time Rate', condition: 'Greater than', target: 65, unit: '%', alert: true },
    ],
  },
  'login-activity': {
    title: 'Login Activity',
    type: 'Line chart',
    column: 'large',
    defaultSize: 'full',
    description: 'Daily login counts — track engagement patterns over the term.',
    insight: PLACEHOLDER.loginActivity.insight,
    render: () => (
      <HighchartsReact highcharts={Highcharts} options={{
        chart: { type: 'spline', height: 240, events: pinLastPointTooltip },
        xAxis: { categories: PLACEHOLDER.loginActivity.days },
        yAxis: { title: { text: null } },
        series: [{ name: 'Logins', data: PLACEHOLDER.loginActivity.counts, showInLegend: false }],
      }} />
    ),
    renderModal: () => (
      <HighchartsReact highcharts={Highcharts} options={{
        chart: { type: 'spline', height: 360 },
        ...modalAxis,
        xAxis: { ...modalAxis.xAxis, categories: PLACEHOLDER.loginActivity.days },
        series: [{ name: 'Logins', data: PLACEHOLDER.loginActivity.counts, showInLegend: false }],
      }} />
    ),
    filters: ['term', 'metric'],
    metrics: ['Daily Logins', 'Weekly Logins'],
    defaultMonitoring: [],
  },
  'discussion': {
    title: 'Discussion Engagement',
    type: 'KPI metrics',
    column: 'medium',
    description: 'Posts, replies, and unique participants in course discussions.',
    insight: ({ monitoring } = {}) =>
      buildDynamicInsight(PLACEHOLDER.discussion.insight, monitoring, PLACEHOLDER.discussion.metrics),
    render: ({ monitoring } = {}) => (
      <KPIGrid
        metrics={PLACEHOLDER.discussion.metrics}
        statuses={computeMetricStatuses(monitoring, PLACEHOLDER.discussion.metrics)}
      />
    ),
    renderModal: () => <KPIGrid metrics={PLACEHOLDER.discussion.metrics} showDescription />,
    filters: ['term', 'metric'],
    metrics: ['Posts', 'Replies', 'Active participants'],
    defaultMonitoring: [],
  },
}

/* The default dashboard layout — used by Dashboard.jsx and as the
   starting layout for the Customize page. */
export const DEFAULT_LAYOUT = {
  large: [
    { id: 'inst-snap', size: 'full' },
    { id: 'sub-health', size: 'full' },
    { id: 'course-status', size: 'full' },
    { id: 'lti-adoption-lg', size: 'half' },
    { id: 'course-perf', size: 'half' },
    { id: 'interaction', size: 'full' },
    { id: 'course-readiness', size: 'full' },
  ],
  medium: [
    { id: 'students-need' },
    { id: 'student-overview' },
    { id: 'faculty' },
    { id: 'course-metrics' },
  ],
}

/* List of conditions used in the Monitoring tab. */
export const MONITORING_CONDITIONS = [
  'Greater than',
  'Greater than or equal to',
  'Less than',
  'Less than or equal to',
  'Equal to',
  'Below target',
]
