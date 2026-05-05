import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import WidgetCard from '../components/widgets/WidgetCard.jsx'
import KPIGrid from '../components/widgets/KPIGrid.jsx'
import ScopeSummary from '../components/dashboard/ScopeSummary.jsx'
import * as data from '../data/mock/widgetData.js'
import * as modal from '../data/mock/modalEnrichments.js'
import * as tables from '../data/mock/tableData.js'
import './Dashboard.css'

/* ── Dashboard chart options (minimal, no axes) ── */

function barChart(categories, series, horizontal = false) {
  return {
    chart: { type: horizontal ? 'bar' : 'column', height: 260 },
    xAxis: { categories },
    yAxis: { title: { text: null } },
    series,
    legend: { enabled: series.length > 1 },
  }
}

/* Keep the tooltip permanently visible on the last point. Highcharts'
   normal hover behavior still moves it when the cursor is over another
   point; we just neutralize its auto-hide so it never disappears. */
function pinTooltipToLastPoint(chart) {
  if (!chart || !chart.series) return
  const series = chart.series.find(s => s.visible && s.points?.length)
  if (!series) return
  const last = series.points[series.points.length - 1]
  if (last) chart.tooltip.refresh(last)
}

const pinLastPointTooltip = {
  load() {
    const chart = this
    // Neutralize the tooltip's hide so it remains visible at all times.
    chart.tooltip.hide = () => {}

    const pin = () => pinTooltipToLastPoint(chart)
    pin()
    setTimeout(pin, 0)
    setTimeout(pin, 300)

    chart.container.addEventListener('mouseleave', pin)
  },
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

/* ── Modal chart options (full detail: gridlines, labels, axes) ── */

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

/* ── Dashboard ── */

export default function Dashboard({ config }) {
  return (
    <div className="dashboard-scroll">
      <div className="dashboard-body">
        {config?.scope && (
          <div className="dashboard-scope-bar">
            <ScopeSummary scope={config.scope} />
          </div>
        )}
        <div className="dashboard-content">
          {/* Left column — large widgets */}
          <div className="dashboard-col-large">

            <WidgetCard
              title="Institution Snapshot"
              insight={data.institutionSnapshot.insight}
              modalFilters={modal.institutionSnapshotModal.filters}
              modalMethodology={modal.institutionSnapshotModal.methodology}
              modalAiSummary={modal.institutionSnapshotModal.aiSummary}
              modalTableData={tables.generateInstitutionTable()}
              modalContent={<KPIGrid metrics={data.institutionSnapshot.metrics} showDescription />}
            >
              <KPIGrid metrics={data.institutionSnapshot.metrics} />
            </WidgetCard>

            <WidgetCard
              title="Sub-Account Health"
              insight={data.subAccountHealth.insight}
              modalContent={
                <HighchartsReact highcharts={Highcharts} options={modalBarChart(data.subAccountHealth.categories, data.subAccountHealth.series)} />
              }
              modalFilters={modal.subAccountHealthModal.filters}
              modalMethodology={modal.subAccountHealthModal.methodology}
              modalAiSummary={modal.subAccountHealthModal.aiSummary}
              modalTableData={tables.generateSubAccountTable()}
            >
              <HighchartsReact highcharts={Highcharts} options={barChart(data.subAccountHealth.categories, data.subAccountHealth.series)} />
            </WidgetCard>

            <WidgetCard
              title="Course Status"
              insight={data.courseStatus.insight}
              modalContent={
                <HighchartsReact highcharts={Highcharts} options={modalStackedBar(data.courseStatus.categories, data.courseStatus.values)} />
              }
              modalFilters={modal.courseStatusModal.filters}
              modalMethodology={modal.courseStatusModal.methodology}
              modalAiSummary={modal.courseStatusModal.aiSummary}
              modalTableData={tables.generateCourseStatusTable()}
            >
              <HighchartsReact highcharts={Highcharts} options={stackedBar(data.courseStatus.categories, data.courseStatus.values)} />
            </WidgetCard>

            <div className="widget-pair">
              <WidgetCard
                title="LTI Adoption"
                insight={data.ltiAdoption.insight}
                modalContent={
                  <HighchartsReact highcharts={Highcharts} options={modalBarChart(data.ltiAdoption.categories, data.ltiAdoption.series, true)} />
                }
                modalFilters={modal.ltiAdoptionModal.filters}
                modalMethodology={modal.ltiAdoptionModal.methodology}
                modalAiSummary={modal.ltiAdoptionModal.aiSummary}
                modalTableData={tables.generateLtiTable()}
              >
                <HighchartsReact highcharts={Highcharts} options={barChart(data.ltiAdoption.categories, data.ltiAdoption.series, true)} />
              </WidgetCard>

              <WidgetCard
                title="Course Performance"
                insight={data.coursePerformance.insight}
                modalContent={
                  <HighchartsReact highcharts={Highcharts} options={{
                    chart: { type: 'spline', height: 360 },
                    ...modalAxis,
                    xAxis: { ...modalAxis.xAxis, categories: data.coursePerformance.breakdown.categories },
                    yAxis: { ...modalAxis.yAxis, labels: { ...modalAxis.yAxis.labels, format: '{value}%' } },
                    series: [{ name: 'Participation', data: data.coursePerformance.breakdown.data, showInLegend: false }],
                    plotOptions: { spline: { dataLabels: { enabled: true, format: '{y}%', style: { fontSize: '11px', color: '#576773' } } } },
                  }} />
                }
                modalFilters={modal.coursePerformanceModal.filters}
                modalMethodology={modal.coursePerformanceModal.methodology}
                modalAiSummary={modal.coursePerformanceModal.aiSummary}
                modalTableData={tables.generateCoursePerformanceTable()}
              >
                <HighchartsReact highcharts={Highcharts} options={{
                  chart: { type: 'spline', height: 200, events: pinLastPointTooltip },
                  xAxis: { categories: data.coursePerformance.breakdown.categories },
                  yAxis: { title: { text: null } },
                  tooltip: { pointFormat: '<b>{point.y}%</b> participation' },
                  series: [{ name: 'Participation', data: data.coursePerformance.breakdown.data, showInLegend: false }],
                }} />
              </WidgetCard>
            </div>

            <WidgetCard
              title="Interaction Over Time"
              insight={data.interactionOverTime.insight}
              modalContent={
                <HighchartsReact highcharts={Highcharts} options={modalLineChart(data.interactionOverTime.weeks, data.interactionOverTime.series, true)} />
              }
              modalFilters={modal.interactionOverTimeModal.filters}
              modalMethodology={modal.interactionOverTimeModal.methodology}
              modalAiSummary={modal.interactionOverTimeModal.aiSummary}
              modalTableData={tables.generateInteractionTable()}
            >
              <HighchartsReact highcharts={Highcharts} options={lineChart(data.interactionOverTime.weeks, data.interactionOverTime.series, true)} />
            </WidgetCard>

            <WidgetCard
              title="Course Readiness"
              insight={data.courseReadiness.insight}
              modalContent={
                <HighchartsReact highcharts={Highcharts} options={modalStackedBar100(data.courseReadiness.categories, data.courseReadiness.series)} />
              }
              modalFilters={modal.courseReadinessModal.filters}
              modalMethodology={modal.courseReadinessModal.methodology}
              modalAiSummary={modal.courseReadinessModal.aiSummary}
              modalTableData={tables.generateCourseReadinessTable()}
            >
              <HighchartsReact highcharts={Highcharts} options={stackedBar100(data.courseReadiness.categories, data.courseReadiness.series)} />
            </WidgetCard>

          </div>

          {/* Right column — medium widgets */}
          <div className="dashboard-col-medium">

            <WidgetCard
              title="Students in Need of Attention"
              insight={data.sinoa.insight}
              modalContent={
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
              }
              modalFilters={modal.sinoaModal.filters}
              modalMethodology={modal.sinoaModal.methodology}
              modalAiSummary={modal.sinoaModal.aiSummary}
              modalTableData={tables.generateSinoaTable()}
            >
              <HighchartsReact highcharts={Highcharts} options={donutChart(data.sinoa.donutData, `${data.sinoa.flagged}`)} />
            </WidgetCard>

            <WidgetCard
              title="Student Overview"
              insight={data.studentOverview.insight}
              modalFilters={modal.studentOverviewModal.filters}
              modalMethodology={modal.studentOverviewModal.methodology}
              modalAiSummary={modal.studentOverviewModal.aiSummary}
              modalTableData={tables.generateStudentOverviewTable()}
              modalContent={<KPIGrid metrics={data.studentOverview.metrics} showDescription />}
            >
              <KPIGrid metrics={data.studentOverview.metrics} />
            </WidgetCard>

            <WidgetCard
              title="Faculty Engagement"
              insight={data.facultyEngagement.insight}
              modalContent={
                <HighchartsReact highcharts={Highcharts} options={modalScoredBarList(data.facultyEngagement.categories, data.facultyEngagement.scores)} />
              }
              modalFilters={modal.facultyEngagementModal.filters}
              modalMethodology={modal.facultyEngagementModal.methodology}
              modalAiSummary={modal.facultyEngagementModal.aiSummary}
              modalTableData={tables.generateFacultyTable()}
            >
              <HighchartsReact highcharts={Highcharts} options={scoredBarList(data.facultyEngagement.categories, data.facultyEngagement.scores)} />
            </WidgetCard>

            <WidgetCard
              title="Course Metrics"
              insight={data.courseMetrics.insight}
              modalFilters={modal.courseMetricsModal.filters}
              modalMethodology={modal.courseMetricsModal.methodology}
              modalAiSummary={modal.courseMetricsModal.aiSummary}
              modalTableData={tables.generateCourseMetricsTable()}
              modalContent={<KPIGrid metrics={data.courseMetrics.metrics} showDescription columns={3} />}
            >
              <KPIGrid metrics={data.courseMetrics.metrics} />
            </WidgetCard>

          </div>
        </div>
        <p className="dashboard-disclaimer">AI can make mistakes. Always double-check your data and insights.</p>
      </div>
    </div>
  )
}
